import { useState } from "react";
import axios from "axios";

export default function Updates() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_BASE || "https://taskbe.sharda.co.in").replace(/\/+$/, "");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.map((s) => s.toLowerCase()).includes(t.toLowerCase())) setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const endpointCandidates = [
    "/api/updates",
    "/api/updates/create",
    "/api/update",
    "/api/announcements",
    "/api/announcements/create",
    "/updates",
    "/updates/create",
  ];

  async function tryPostToCandidates(payload, headers) {
    const errors = [];
    for (const path of endpointCandidates) {
      const url = `${API_BASE}${path}`;
      try {
        const res = await axios.post(url, payload, { headers });
        return { ok: true, url, data: res.data };
      } catch (err) {
        const status = err?.response?.status;
        const body =
          typeof err?.response?.data === "string" ? err.response.data : JSON.stringify(err?.response?.data);
        errors.push({ url, status, body });
        if (status === 401 || status === 403) break;
      }
    }
    return { ok: false, errors };
  }

  const saveUpdateToDB = async (saveObj) => {
    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/updates",
        {
          description: saveObj.details,
          tags: saveObj.tags,
          title: saveObj.title,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to save update:", error?.response?.data || error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const d = details.trim();
    if (!t || !d) return alert("Title aur Details required hain.");

    setLoading(true);

    try {
      const nowIso = new Date().toISOString();
      const localId = window.crypto?.randomUUID?.() || String(Date.now());
      const updateObj = {
        title: t,
        details: d,
        tags,
      };

      console.log(updateObj, " - payload to be saved");

      await saveUpdateToDB(updateObj);

      window.dispatchEvent(new CustomEvent("updates:changed", { detail: updateObj }));

      alert("✅ Update saved successfully.");

      setTitle("");
      setDetails("");
      setTags([]);
      setTagInput("");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to save update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-[100svh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
        px-4 sm:px-6 lg:px-8
        py-4 sm:py-8
      "
    >
      <h1
        className="
          text-center font-bold tracking-tight
          text-2xl sm:text-3xl lg:text-4xl
          mb-4 sm:mb-6
          text-gray-800
        "
      >
        Add New Update
      </h1>

      <form
        onSubmit={handleSubmit}
        className="
          mx-auto w-full max-w-3xl
          bg-white/95 backdrop-blur
          rounded-2xl border border-gray-200 shadow-xl
          p-4 sm:p-6 lg:p-8
          space-y-4 sm:space-y-6
        "
      >
        {/* Title + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-5">
          {/* Title */}
          <div className="md:col-span-3">
            <label htmlFor="title" className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="
                w-full rounded-lg border border-gray-300 bg-white text-gray-900
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                text-sm sm:text-base px-3 py-2.5
              "
              placeholder="Enter update title"
            />
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">Tags</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                  if (e.key === "Backspace" && tagInput === "" && tags.length) {
                    e.preventDefault();
                    removeTag(tags[tags.length - 1]);
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  if (!text) return;
                  e.preventDefault();
                  text
                    .split(/[,\n;]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .forEach((v) => {
                      if (!tags.map((s) => s.toLowerCase()).includes(v.toLowerCase())) {
                        setTags((prev) => [...prev, v]);
                      }
                    });
                  setTagInput("");
                }}
                className="
                  flex-1 rounded-lg border border-gray-300 bg-white text-gray-900
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  text-sm sm:text-base px-3 py-2.5
                "
                placeholder="Type a tag, press Enter or Comma"
              />
              <button
                type="button"
                onClick={addTag}
                className="
                  w-full sm:w-auto
                  rounded-lg px-3 sm:px-4 py-2.5
                  bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]
                  text-white text-sm sm:text-base font-semibold
                  transition focus:outline-none focus:ring-2 focus:ring-indigo-400
                "
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto sm:max-h-none pr-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      bg-indigo-100 border border-indigo-200
                      px-2.5 py-1 rounded-full
                      text-xs sm:text-sm inline-flex items-center gap-2
                      text-indigo-700
                    "
                  >
                    #{tag}
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600 focus:outline-none"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <label htmlFor="details" className="block text-xs sm:text-sm mb-1 text-gray-700 font-medium">
            Description
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={6}
            className="
              w-full rounded-lg border border-gray-300 bg-white text-gray-900
              placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              text-sm sm:text-base px-3 py-3 leading-relaxed
              resize-y
            "
            placeholder="Enter Your Description here"
          />
        </div>

        {/* Submit */}
        <div className="pt-1 sm:pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full rounded-lg py-3
              font-semibold
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]"}
              text-white text-base sm:text-lg
              transition focus:outline-none focus:ring-2 focus:ring-indigo-400
            `}
          >
            {loading ? "Saving..." : "Publish Update"}
          </button>
        </div>
      </form>
    </div>
  );
}