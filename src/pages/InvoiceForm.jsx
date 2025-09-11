import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import CreatableSelect from "react-select/creatable";
import "../css/InvoiceForm.css";
import axios from "../utils/secureAxios";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { FaTrash, FaTimes, FaRegCalendarAlt } from "react-icons/fa";
import { FiSave, FiDownload, FiEdit, FiEye } from "react-icons/fi";
import InvoicePage from "../Components/invoice/InvoicePage";
import CreateClientModal from "../Components/client/CreateClientModal";
import { IoClose } from "react-icons/io5";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ITEMS_PER_PAGE = 8;
const invoiceTypes = ["Proforma Invoice", "Tax Invoice", "Invoice"];

export default function InvoiceForm({
  initialInvoice = null,
  onSaved,
  onClose,
}) {
  const PREVIEW_W = 794;
  const PREVIEW_H = 1122;
  const PREVIEW_SCALE = 0.9;
  const [activeTab, setActiveTab] = useState("form");
  const [previewScale, setPreviewScale] = useState(PREVIEW_SCALE);
  const previewWrapRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const el = previewWrapRef.current;
      if (!el) return;
      const avail = el.clientWidth - 16;
      setPreviewScale(Math.min(1, avail / PREVIEW_W));
    };

    update();

    const ro = new ResizeObserver(update);
    const el = previewWrapRef.current;
    if (el) ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const isEdit = !!initialInvoice;
  const [firms, setFirms] = useState([]);
  const [selectedFirmId, setSelectedFirmId] = useState("");
  const [firmsLoading, setFirmsLoading] = useState(true);
  const [firmsError, setFirmsError] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [invoiceType, setInvoiceType] = useState(invoiceTypes[0]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);
  const [notes, setNotes] = useState([]);
  const [selectedClientOption, setSelectedClientOption] = useState(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [draftClient, setDraftClient] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [placeOfSupply, setPlaceOfSupply] = useState("Madhya Pradesh");
  const [customer, setCustomer] = useState({
    _id: "",
    name: "",
    address: "",
    GSTIN: "",
    mobile: "",
    emailId: "",
  });
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([
    {
      id: uuidv4(),
      description: "Project Report",
      hsn: "9971",
      qty: 1,
      rate: 1000,
      gst: 0,
    },
  ]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [imagesReady, setImagesReady] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    hsn: "9971",
    qty: 1,
    rate: 0,
    gst: 0,
  });

  const invoiceRef = useRef();
  const isSharda = selectedFirm?.name === "Sharda Associates";
  const showGSTIN = !!selectedFirm?.gstin;
  const offsetPage1 = 0;
  const offsetPage2 = ITEMS_PER_PAGE;
  const originalInvNoRef = useRef("");

  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.name}${
      client.businessName ? ` (${client.businessName})` : ""
    }`,
  }));

  const isLocalSupply = () => {
    const place = placeOfSupply.toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  const taxableValue = totalAmount;
  const igstRate = 0.18;
  const cgstRate = 0.09;
  const sgstRate = 0.09;

  const igstAmount = isLocalSupply() ? 0 : taxableValue * igstRate;
  const cgstAmount = isLocalSupply() ? taxableValue * cgstRate : 0;
  const sgstAmount = isLocalSupply() ? taxableValue * sgstRate : 0;
  const totalTax = igstAmount + cgstAmount + sgstAmount;
  const totalAmountWithTax = taxableValue + totalTax;

  const page1Items = items.slice(0, ITEMS_PER_PAGE);
  const page2Items = items.slice(ITEMS_PER_PAGE);

  const activeBank =
    selectedFirm?.banks?.[selectedBankIndex] ?? selectedFirm?.bank ?? null;

  useEffect(() => {
    const loadFirms = async () => {
      try {
        setFirmsLoading(true);
        const res = await axios.get("https://taskbe.sharda.co.in/firms");
        setFirms(res.data || []);
        if (!isEdit && (res.data || []).length) {
          setSelectedFirmId(res.data[0]._id);
          setSelectedFirm(res.data[0]);
        }
      } catch (e) {
        setFirmsError("Failed to load firms");
        console.error(e);
      } finally {
        setFirmsLoading(false);
      }
    };
    loadFirms();
  }, []);

  useEffect(() => {
    if (!selectedFirmId) {
      setSelectedFirm(null);
      return;
    }
    const f = firms.find((x) => x._id === selectedFirmId) || null;
    setSelectedFirm(f);
    setSelectedBankIndex(0);
  }, [selectedFirmId, firms]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/clients/details");
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (!selectedClientOption) {
      setCustomer({
        _id: "",
        name: "",
        address: "",
        GSTIN: "",
        mobile: "",
        emailId: "",
      });
      setItems([]);
      return;
    }

    const fetchTasks = async () => {
      const client = clients.find((c) => c._id === selectedClientOption.value);
      if (!client) return;

      setCustomer({
        _id: client._id,
        name: client.name,
        address: client.address || "",
        GSTIN: client.GSTIN || "",
        mobile: client.mobile || "",
        emailId: client.emailId || "",
      });

      try {
        let url = `/tasks/by-client-name/${encodeURIComponent(client.name)}`;
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        const response = await axios.get(url);
        const tasks = response.data || [];
        const taskItems = tasks.map((task) => ({
          id: uuidv4(),
          description: task.taskName || task.workDesc || "Task",
          hsn: "9971",
          qty: 1,
          rate: 1000,
          gst: 0,
        }));
        setItems(taskItems.length ? taskItems : []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchTasks();
  }, [selectedClientOption, fromDate, toDate]);

  useEffect(() => {
    if (!isEdit || !initialInvoice) return;

    const inv = initialInvoice;
    originalInvNoRef.current = inv.invoiceNumber;
    setInvoiceNumber(inv.invoiceNumber);
    setIsFinalized(true);

    setInvoiceType(inv.invoiceType || invoiceTypes[0]);

    const d = inv.invoiceDate ? new Date(inv.invoiceDate) : new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    setInvoiceDate(ymd);

    setPlaceOfSupply(inv.placeOfSupply || "");
    setCustomer(inv.customer || {});

    setItems(
      (inv.items || []).map((it) => ({
        id: uuidv4(),
        description: it.description || "",
        hsn: it.hsn || "9971",
        qty: Number(it.qty) || 1,
        rate: Number(it.rate) || 0,
        gst: Number(it.gst) || 0,
      }))
    );

    const notesArr =
      typeof inv.notes === "string"
        ? inv.notes
            .split("\n")
            .filter(Boolean)
            .map((t) => ({ id: uuidv4(), text: t }))
        : (inv.notes || []).map((n) => ({
            id: uuidv4(),
            text: typeof n === "string" ? n : n?.text || "",
          }));
    setNotes(notesArr);

    const f = inv.selectedFirm || null;
    setSelectedFirmId(f?._id || "");
    setSelectedFirm(f || null);

    const invBank = f?.bank;
    const idx = (f?.banks || []).findIndex(
      (b) =>
        (b?._id && invBank?._id && b._id === invBank._id) ||
        (b.accountNumber || b.account) ===
          (invBank?.accountNumber || invBank?.account)
    );
    setSelectedBankIndex(idx >= 0 ? idx : 0);
  }, [isEdit, initialInvoice]);

  useEffect(() => {
    if (isEdit) return;
    setInvoiceNumber("");
    setIsFinalized(false);
    if (selectedFirm && invoiceType) previewInvoiceNumber();
  }, [isEdit, selectedFirmId, selectedFirm, invoiceType]);

  const previewInvoiceNumber = async () => {
    if (isEdit) return;
    if (!selectedFirm) return;
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    try {
      const res = await axios.get(
        "https://taskbe.sharda.co.in/api/invoices/preview-serial",
        {
          params: {
            firmId: selectedFirm?._id,
            type: invoiceType,
            year,
            month,
          },
        }
      );
      setInvoiceNumber(res.data?.invoiceNumber || "");
    } catch (err) {
      console.error("preview-serial failed:", err);
      setInvoiceNumber("");
      Swal.fire(
        "Couldn't preview invoice number",
        "Check API URL/Network.",
        "warning"
      );
    }
  };

  const finalizeInvoiceNumber = async () => {
    if (isFinalized && invoiceNumber) return invoiceNumber;
    if (!selectedFirm) throw new Error("No firm selected");
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    try {
      const res = await axios.post(
        "https://taskbe.sharda.co.in/api/invoices/finalize-serial",
        {
          firmId: selectedFirm?._id,
          type: invoiceType,
          year,
          month,
        }
      );
      setInvoiceNumber(res.data.invoiceNumber);
      setIsFinalized(true);
      return res.data.invoiceNumber;
    } catch (error) {
      console.error("Error finalizing invoice number", error);
      throw error;
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const deleteItem = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this task from the invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The task has been removed.", "success");
      }
    });
  };

  const addItem = () => {
    if (newItem.description.trim() === "") {
      Swal.fire("Error", "Please enter a description for the item.", "error");
      return;
    }

    setItems([...items, { id: uuidv4(), ...newItem }]);

    setNewItem({
      description: "",
      hsn: "9971",
      qty: 1,
      rate: 0,
      gst: 0,
    });

    setShowAddItemModal(false);
  };

  const addNote = () => {
    setNotes((prev) => [...prev, { id: uuidv4(), text: "" }]);
  };

  const updateNote = (id, text) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id) => {
    Swal.fire({
      title: "Delete note?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        Swal.fire("Deleted!", "Note removed.", "success");
      }
    });
  };

  function numberToWordsIndian(num) {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const numberToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + numberToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          numberToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + numberToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          numberToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + numberToWords(n % 100000) : "")
        );
      return (
        numberToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + numberToWords(n % 10000000) : "")
      );
    };

    const [rupees, paise] = num.toFixed(2).split(".");
    const rupeeWords = numberToWords(parseInt(rupees));
    const paiseWords =
      paise !== "00" ? ` and ${numberToWords(parseInt(paise))} Paise` : "";
    return rupeeWords + paiseWords + " Rupees Only";
  }

  const handleSaveAndDownloadPDF = async () => {
    try {
      const finalNo = await finalizeInvoiceNumber();
      setInvoiceNumber(finalNo);

      const firmSnapshot = {
        _id: selectedFirm?._id,
        name: selectedFirm?.name,
        address: selectedFirm?.address,
        phone: selectedFirm?.phone,
        gstin: selectedFirm?.gstin,
        bank: activeBank
          ? {
              _id: activeBank._id,
              label: activeBank.label || "",
              bankName: activeBank.bankName || activeBank.name || "",
              accountName: activeBank.accountName || "",
              accountNumber:
                activeBank.accountNumber || activeBank.account || "",
              ifsc: activeBank.ifsc || "",
              upiIdName: activeBank.upiIdName || "",
              upiMobile: activeBank.upiMobile || "",
              upiId: activeBank.upiId || "",
            }
          : null,
      };

      const invoiceData = {
        invoiceNumber: finalNo,
        invoiceDate,
        invoiceType,
        selectedFirm: firmSnapshot,
        placeOfSupply,
        customer,
        items,
        totalAmount: totalAmountWithTax,
        notes,
      };

      await axios.post("/invoices", invoiceData);

      await Swal.fire({
        icon: "success",
        title: "Invoice Saved",
        text: `Invoice ${finalNo} has been successfully saved.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });

      if (!invoiceRef.current) return;
      const element = invoiceRef.current;
      element.style.transform = "scale(1)";
      element.style.transformOrigin = "top left";
      element.style.width = `${element.scrollWidth}px`;

      const opt = {
        margin: 0,
        padding: 0,
        filename: `${finalNo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          dpi: 300,
          letterRendering: true,
          useCORS: true,
          width: element.scrollWidth,
          windowWidth: element.scrollWidth,
        },
        jsPDF: {
          unit: "px",
          orientation: "portrait",
          format: [794, 1122],
        },
        pagebreak: { mode: ["css", "legacy"], avoid: ".invoice-note" },
      };

      await html2pdf().set(opt).from(element).save();

      element.style.transform = "scale(0.90)";
      element.style.transformOrigin = "top left";
      element.style.width = "";
    } catch (error) {
      console.error("Failed to save or generate PDF:", error);
      Swal.fire("Error", "Could not save or generate the invoice.", "error");
    }
  };

  const handleUpdateInvoice = async () => {
    try {
      const firmSnapshot = {
        _id: selectedFirm?._id,
        name: selectedFirm?.name,
        address: selectedFirm?.address,
        phone: selectedFirm?.phone,
        gstin: selectedFirm?.gstin,
        bank: activeBank
          ? {
              _id: activeBank._id,
              label: activeBank.label || "",
              bankName: activeBank.bankName || activeBank.name || "",
              accountName: activeBank.accountName || "",
              accountNumber:
                activeBank.accountNumber || activeBank.account || "",
              ifsc: activeBank.ifsc || "",
              upiIdName: activeBank.upiIdName || "",
              upiMobile: activeBank.upiMobile || "",
              upiId: activeBank.upiId || "",
            }
          : null,
      };

      const payload = {
        invoiceNumber,
        invoiceDate,
        invoiceType,
        selectedFirm: firmSnapshot,
        placeOfSupply,
        customer,
        items,
        notes,
        totalAmount: totalAmountWithTax,
      };

      const idForUpdate = isEdit ? originalInvNoRef.current : invoiceNumber;
      await axios.put(
        `https://taskbe.sharda.co.in/api/invoices/${encodeURIComponent(
          idForUpdate
        )}`,
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Invoice Updated",
        text: `Invoice ${invoiceNumber} has been updated.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not update the invoice.", "error");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!invoiceRef.current) return;

      const element = invoiceRef.current;

      const prevTransform = element.style.transform;
      const prevTransformOrigin = element.style.transformOrigin;
      const prevWidth = element.style.width;

      element.style.transform = "scale(1)";
      element.style.transformOrigin = "top left";
      element.style.width = `${element.scrollWidth}px`;

      const opt = {
        margin: 0,
        padding: 0,
        filename: `${invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          dpi: 300,
          letterRendering: true,
          useCORS: true,
          width: element.scrollWidth,
          windowWidth: element.scrollWidth,
        },
        jsPDF: {
          unit: "px",
          orientation: "portrait",
          format: [794, 1122],
        },
        pagebreak: { mode: "css" },
      };

      await html2pdf().set(opt).from(element).save();

      element.style.transform = prevTransform || `scale(${previewScale})`;
      element.style.transformOrigin = prevTransformOrigin || "top left";
      element.style.width = prevWidth || "";
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not generate the invoice PDF.", "error");
    }
  };

  const openCreateClientModal = (inputValue) => {
    setDraftClient({ name: inputValue });
    setCreateClientOpen(true);
  };

  const handleCreateClient = async (formData) => {
    try {
      const res = await axios.post("/clients", formData);
      const newClient = res.data?.client;

      setClients((prev) => [...prev, newClient]);

      const label = `${newClient.name}${
        newClient.businessName ? ` (${newClient.businessName})` : ""
      }`;
      const option = { value: newClient._id, label };
      setSelectedClientOption(option);

      setCustomer({
        _id: newClient._id,
        name: newClient.name,
        address: newClient.address || "",
        GSTIN: newClient.GSTIN || "",
        mobile: newClient.mobile || "",
        emailId: newClient.emailId || "",
      });

      setCreateClientOpen(false);
      setDraftClient(null);
      Swal.fire("Client created", `"${newClient.name}" added.`, "success");
    } catch (err) {
      if (err?.response?.status === 409) {
        Swal.fire(
          "Already exists",
          "A client with this name already exists.",
          "warning"
        );
      } else {
        console.error(err);
        Swal.fire("Error", "Could not create client.", "error");
      }
    }
  };

  const calculateNotesPages = () => {
    if (notes.length === 0) return 0;

    const approxLinesPerPage = 40;
    let totalLines = 0;

    notes.forEach((note) => {
      const lines = Math.ceil(note.text.length / 60) + 1;
      totalLines += lines;
    });

    return Math.ceil(totalLines / approxLinesPerPage);
  };

  const splitNotesForPages = (notes, maxNotesPerPage = 5) => {
    if (notes.length === 0) return [[], []];
    if (notes.length <= maxNotesPerPage) return [notes, []];
    return [notes.slice(0, maxNotesPerPage), notes.slice(maxNotesPerPage)];
  };

  const notesPages = calculateNotesPages();
  const [notesPage1, notesPage2] = splitNotesForPages(notes);

  const renderFormContent = () => (
    <div className="space-y-1 lg:space-y-4">
      {/* Date Range */}
      {!isEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative w-full max-w-xs lg:max-w-md">
              <DatePicker
                selected={fromDate ? new Date(fromDate) : null}
                onChange={(date) =>
                  setFromDate(date ? date.toISOString().split("T")[0] : "")
                }
                selectsStart
                startDate={fromDate ? new Date(fromDate) : null}
                endDate={toDate ? new Date(toDate) : null}
                maxDate={toDate ? new Date(toDate) : null}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select From Date"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 pr-10 py-2 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 lg:px-4 lg:pr-12 lg:py-2"
              />
              <FaRegCalendarAlt
                className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative w-full max-w-xs lg:max-w-md">
              <DatePicker
                selected={toDate ? new Date(toDate) : null}
                onChange={(date) =>
                  setToDate(date ? date.toISOString().split("T")[0] : "")
                }
                selectsEnd
                startDate={fromDate ? new Date(fromDate) : null}
                endDate={toDate ? new Date(toDate) : null}
                minDate={fromDate ? new Date(fromDate) : null}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select To Date"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 pr-10 py-2 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 lg:px-4 lg:pr-12 lg:py-2"
              />
              <FaRegCalendarAlt
                className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      )}
      {isEdit && (
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3 lg:gap-6">
          <div className="col-span-2">
            <label className="block text-xs text-gray-600">Invoice No.</label>
            <input
              readOnly
              value={invoiceNumber}
              className={`mt-1 w-full border rounded-md px-3 py-2 shadow-sm
              ${
                isEdit
                  ? "locked-field locked-cursor"
                  : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              } lg:px-4 lg:py-3`}
            />
          </div>
        </div>
      )}

      {/* Firm Dropdown */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 lg:mb-4 lg:text-xl">
          Your Details
        </h2>
        <label className="block text-sm font-medium text-gray-700">
          Select Firm
        </label>

        {firmsLoading ? (
          <div className="mt-1 text-sm text-gray-500">Loading firms…</div>
        ) : firmsError ? (
          <div className="mt-1 text-sm text-red-600">{firmsError}</div>
        ) : (
          <Select
            value={
              firms.find((f) => f._id === selectedFirmId)
                ? {
                    value: selectedFirmId,
                    label: firms.find((f) => f._id === selectedFirmId).name,
                  }
                : null
            }
            onChange={(option) => setSelectedFirmId(option?.value)}
            options={firms.map((f) => ({ value: f._id, label: f.name }))}
            isDisabled={isEdit}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        )}
      </div>

      {/* Bank Dropdown */}
      {selectedFirm?.banks?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Bank Account
          </label>
          <Select
            value={
              selectedFirm?.banks?.[selectedBankIndex]
                ? {
                    value: selectedBankIndex,
                    label:
                      selectedFirm.banks[selectedBankIndex].label ||
                      `${
                        selectedFirm.banks[selectedBankIndex].bankName ||
                        selectedFirm.banks[selectedBankIndex].name
                      } - ${
                        selectedFirm.banks[selectedBankIndex].accountNumber ||
                        selectedFirm.banks[selectedBankIndex].account
                      }`,
                  }
                : null
            }
            onChange={(option) => setSelectedBankIndex(option?.value)}
            options={selectedFirm?.banks?.map((bank, idx) => ({
              value: idx,
              label:
                bank.label ||
                `${bank.bankName || bank.name} - ${
                  bank.accountNumber || bank.account
                }`,
            }))}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
      )}

      {/* Invoice Type and Invoice Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Type
          </label>
          <div className="w-full max-w-xs lg:max-w-md">
            <Select
              value={
                invoiceType ? { value: invoiceType, label: invoiceType } : null
              }
              onChange={(option) => setInvoiceType(option.value)}
              options={invoiceTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              isDisabled={isEdit}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: 40 }),
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Date
          </label>
          <div className="relative w-full max-w-xs lg:max-w-md">
            <DatePicker
              selected={invoiceDate ? new Date(invoiceDate) : null}
              onChange={(date) =>
                setInvoiceDate(date ? date.toISOString().split("T")[0] : "")
              }
              dateFormat="yyyy-MM-dd"
              placeholderText="Select Invoice Date"
              className="mt-0 w-full border border-gray-300 rounded-md px-3 pr-10 py-2 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 lg:px-4 lg:pr-12 lg:py-2"
            />
            <FaRegCalendarAlt
              className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 lg:mb-4 lg:text-xl">
          Customer Details
        </h2>
        {isEdit ? (
          <input
            readOnly
            value={customer?.name || ""}
            className={`mt-1 w-full border rounded-md px-3 py-2 shadow-sm
           ${
             isEdit
               ? "locked-field locked-cursor"
               : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
           } lg:px-4 lg:py-3`}
            title="Client is locked for existing invoice"
          />
        ) : (
          <CreatableSelect
            options={clientOptions}
            value={selectedClientOption}
            onChange={(option) => setSelectedClientOption(option)}
            onCreateOption={openCreateClientModal}
            formatCreateLabel={(inputValue) => `+ Add client "${inputValue}"`}
            placeholder="Search or select client..."
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                marginBottom: "10px",
                minHeight: "40px",
                borderRadius: "0.375rem",
                borderColor: "#d1d5db",
              }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
            theme={(theme) => ({
              ...theme,
              colors: { ...theme.colors, primary: "#1a73e8" },
            })}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Place of Supply
        </label>
        <input
          placeholder="Place of Supply"
          value={placeOfSupply}
          onChange={(e) => setPlaceOfSupply(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 lg:px-4 lg:py-3"
        />
      </div>

      <div className="relative max-h-[20vh] overflow-y-auto pr-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 lg:mb-3 lg:text-xl">
          Items
        </h2>

        {/* Items List */}
        {items.map((item, idx) => {
          const amount = (item.qty * item.rate).toFixed(2);
          return (
            <div
              key={idx}
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white shadow-sm lg:p-4 lg:mb-3"
            >
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Description"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(idx, "qty", Number(e.target.value))
                    }
                    min={1}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Rate
                  </label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      updateItem(idx, "rate", Number(e.target.value))
                    }
                    step="0.01"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    readOnly
                    value={`₹${amount}`}
                    className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="mt-6 transition text-red-500 hover:text-red-800"
                  title="Delete Task"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        {/* Sticky Add Item Button */}
        <div className="mt-0 sticky bottom-0 bg-white py-1 text-center border-t border-gray-200">
          <button
            onClick={() => setShowAddItemModal(true)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm sm:text-base transition"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="mb-7 notes-section">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 lg:text-xl">
          Notes
        </h2>

        {notes.length === 0 && (
          <div className="text-sm text-gray-500 mb-2">
            Add your first note for this invoice.
          </div>
        )}

        {notes.map((n, idx) => (
          <div
            key={n.id}
            className="border border-gray-300 rounded-lg p-3 mb-2 bg-white shadow-sm invoice-note"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note {idx + 1}
            </label>
            <textarea
              value={n.text}
              onChange={(e) => updateNote(n.id, e.target.value)}
              rows={2}
              placeholder="Write a remark or note for this invoice..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => deleteNote(n.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-2"
                title="Delete Note"
              >
                <FaTrash />
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addNote}
          className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm transition text-center"
        >
          + Add Note
        </button>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="preview-tab-content-mobile" ref={previewWrapRef}>
      <div
        className="mobile-preview-container"
        style={{
          width: "100%",
          overflow: "auto",
          margin: "0 auto",
          padding: "8px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="invoice-preview-mobile"
          ref={invoiceRef}
          style={{
            backgroundColor: "#fff",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: 12,
            color: "#000",
            width: "100%",
            maxWidth: PREVIEW_W,
            height: PREVIEW_H,
            transform: `scale(${Math.min(1, window.innerWidth / PREVIEW_W)})`,
            transformOrigin: "top left",
            boxShadow: "0 0 0 1px #e5e7eb",
          }}
        >
          <div>
            <InvoicePage
              pageNumber={1}
              itemsOnPage={page1Items}
              offset={offsetPage1}
              isLastPage={page2Items.length === 0}
              customer={customer}
              selectedFirm={{ ...selectedFirm, bank: activeBank }}
              invoiceType={invoiceType}
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              placeOfSupply={placeOfSupply}
              isSharda={isSharda}
              totalAmount={totalAmount}
              totalAmountWithTax={totalAmountWithTax}
              taxableValue={taxableValue}
              igstAmount={igstAmount}
              cgstAmount={cgstAmount}
              sgstAmount={sgstAmount}
              numberToWordsIndian={numberToWordsIndian}
              onImagesLoaded={() => setImagesReady(true)}
              showGSTIN={showGSTIN}
              notes={notesPage1}
            />

            {page2Items.length > 0 && (
              <InvoicePage
                pageNumber={2}
                itemsOnPage={page2Items}
                offset={offsetPage2}
                isLastPage={true}
                customer={customer}
                selectedFirm={{ ...selectedFirm, bank: activeBank }}
                invoiceType={invoiceType}
                invoiceNumber={invoiceNumber}
                invoiceDate={invoiceDate}
                placeOfSupply={placeOfSupply}
                isSharda={isSharda}
                totalAmount={totalAmount}
                totalAmountWithTax={totalAmountWithTax}
                taxableValue={taxableValue}
                igstAmount={igstAmount}
                cgstAmount={cgstAmount}
                sgstAmount={sgstAmount}
                numberToWordsIndian={numberToWordsIndian}
                onImagesLoaded={() => setImagesReady(true)}
                notes={notesPage2}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .locked-field {
          background-color: #fff7d6 !important;
          border-color: #d1d5db !important;
          color: #374151 !important;
        }
        .locked-cursor, .locked-cursor * {
          cursor: not-allowed !important;
        }
       
        @media (max-width: 1024px) {

        .preview-tab-content-mobile {
          width: 100%;
          overflow-x: auto;
          }
 
        .invoice-preview-mobile {
           transform-origin: top left;
           margin: 0 auto;
        }
 
        .mobile-preview-container {
           width: 100% !important;
           padding: 8px;
       }
          .invoice-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
            background: white;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            justify-content: center;
          }
         
          .invoice-tab {
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.2s;
            white-space: nowrap;
          }
         
          .invoice-tab.active {
            border-bottom-color: #3b82f6;
            color: #3b82f6;
            background-color: #f8fafc;
          }
         
          .invoice-tab:not(.active):hover {
            background-color: #f1f5f9;
          }
         
          .tab-content {
            flex: 1;
            overflow-y: auto;
            background: white;
            border-radius: 0 0 8px 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
          }
         
          .preview-tab-content {
            height: 100%;
            overflow-y: auto;
            padding: 8px;
            background: #f3f4f6;
            border-radius: 8px;
            display: flex;
            justify-content: center;
          }
         
          .invoice-left.scrollable-panel {
            max-height: calc(100vh - 250px);
            overflow-y: auto;
            padding-right: 8px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
          }
         
          .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
         
          .btn-primary {
            padding: 10px 20px;
            background-color: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            transition: background-color 0.2s;
          }
         
          .btn-primary:hover {
            background-color: #059669;
          }
         
          .btn-secondary {
            padding: 10px 20px;
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }
         
          .btn-secondary:hover {
            background-color: #e5e7eb;
          }
        }
       
        @media print {
          .invoice-note {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .notes-container {
            break-inside: auto;
          }
        }
       
        .invoice-note {
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px dotted #eee;
        }
       
        .note-number {
          font-weight: bold;
          margin-right: 5px;
        }
       
        .note-text {
          white-space: pre-line;
        }
       
        .add-item-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
       
        .add-item-modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }
       
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
       
        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }
       
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
       
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
       
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
       
        .modal-close:hover {
          color: #000;
        }
      `}</style>

      {/* Mobile/Tablet View with Tabs */}
      <div className="lg:hidden">
        <div className="invoice-tabs">
          <div
            className={`invoice-tab ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            <FiEdit /> Form
          </div>
          <div
            className={`invoice-tab ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <FiEye /> Preview
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "form" && (
            <div className="action-buttons">
              {isEdit ? (
                <>
                  <button
                    onClick={handleUpdateInvoice}
                    className="btn-primary"
                    title="Update Invoice"
                  >
                    <FiSave />
                    <span>Update Invoice</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn-primary"
                    title="Download PDF"
                  >
                    <FiDownload />
                    <span>Download PDF</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveAndDownloadPDF}
                  className="btn-primary"
                  title="Save and Download PDF"
                >
                  <FiSave />
                  <span>Save & Generate PDF</span>
                  <FiDownload />
                </button>
              )}

              {onClose && (
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              )}
            </div>
          )}

          {activeTab === "form" ? (
            <div className="invoice-left scrollable-panel">
              {renderFormContent()}
            </div>
          ) : (
            <div className="preview-tab-content-mobile">
              <div
                className="overflow-y-auto bg-gray-50 p-2 rounded-md"
                style={{
                  maxHeight: "calc(100vh - 150px)",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    padding: "8px",
                  }}
                >
                  <div
                    className="invoice-preview-mobile"
                    ref={invoiceRef}
                    style={{
                      backgroundColor: "#fff",
                      fontFamily:
                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      fontSize: 12,
                      color: "#000",
                      width: "100%",
                      maxWidth: PREVIEW_W,
                      height: PREVIEW_H,
                      transform: `scale(${Math.min(
                        1,
                        window.innerWidth / PREVIEW_W
                      )})`,
                      transformOrigin: "top left",
                      boxShadow: "0 0 0 1px #e5e7eb",
                    }}
                  >
                    <div>
                      <InvoicePage
                        pageNumber={1}
                        itemsOnPage={page1Items}
                        offset={offsetPage1}
                        isLastPage={page2Items.length === 0}
                        customer={customer}
                        selectedFirm={{ ...selectedFirm, bank: activeBank }}
                        invoiceType={invoiceType}
                        invoiceNumber={invoiceNumber}
                        invoiceDate={invoiceDate}
                        placeOfSupply={placeOfSupply}
                        isSharda={isSharda}
                        totalAmount={totalAmount}
                        totalAmountWithTax={totalAmountWithTax}
                        taxableValue={taxableValue}
                        igstAmount={igstAmount}
                        cgstAmount={cgstAmount}
                        sgstAmount={sgstAmount}
                        numberToWordsIndian={numberToWordsIndian}
                        onImagesLoaded={() => setImagesReady(true)}
                        showGSTIN={showGSTIN}
                        notes={notesPage1}
                      />

                      {page2Items.length > 0 && (
                        <InvoicePage
                          pageNumber={2}
                          itemsOnPage={page2Items}
                          offset={offsetPage2}
                          isLastPage={true}
                          customer={customer}
                          selectedFirm={{ ...selectedFirm, bank: activeBank }}
                          invoiceType={invoiceType}
                          invoiceNumber={invoiceNumber}
                          invoiceDate={invoiceDate}
                          placeOfSupply={placeOfSupply}
                          isSharda={isSharda}
                          totalAmount={totalAmount}
                          totalAmountWithTax={totalAmountWithTax}
                          taxableValue={taxableValue}
                          igstAmount={igstAmount}
                          cgstAmount={cgstAmount}
                          sgstAmount={sgstAmount}
                          numberToWordsIndian={numberToWordsIndian}
                          onImagesLoaded={() => setImagesReady(true)}
                          notes={notesPage2}
                          showGSTIN={showGSTIN}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View - Side by Side */}
      <div className="hidden lg:flex gap-5 p-5 bg-gray-100 overflow-x-auto items-start max-h-[95vh] overflow-y-hidden">
        {/* Left form side */}
        <div className="scrollable-panel flex-none w-[500px] h-full overflow-y-auto pr-2 box-border pl-1">
          <div className="max-h-[90vh] overflow-y-auto pt-6 pr-1">
            <div className="flex gap-2 justify-center items-center mb-3">
              {isEdit && (
                <button
                  onClick={handleUpdateInvoice}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  title="Update Invoice"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Update Invoice</span>
                </button>
              )}

              {isEdit && (
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  title="Download PDF"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              )}

              {!isEdit && (
                <button
                  onClick={handleSaveAndDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  title="Save and Download PDF"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save & Generate PDF</span>
                  <FiDownload className="w-4 h-4" />
                </button>
              )}

              {onClose && (
                <button onClick={onClose} className="px-4 py-2 border rounded">
                  Close
                </button>
              )}
            </div>

            {renderFormContent()}
          </div>
        </div>

        {/* Right preview side */}
        <div
          className="overflow-y-auto bg-gray-50 p-4 rounded-md"
          style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}
        >
          <div
            style={{
              width: PREVIEW_W * PREVIEW_SCALE,
              height: PREVIEW_H * PREVIEW_SCALE,
              overflow: "visible",
            }}
          >
            <div
              className="invoice-right screen-preview"
              ref={invoiceRef}
              style={{
                backgroundColor: "#fff",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                fontSize: 12,
                color: "#000",
                width: PREVIEW_W,
                height: PREVIEW_H,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                boxShadow: "0 0 0 1px #e5e7eb",
              }}
            >
              <div>
                <InvoicePage
                  pageNumber={1}
                  itemsOnPage={page1Items}
                  offset={offsetPage1}
                  isLastPage={page2Items.length === 0}
                  customer={customer}
                  selectedFirm={{ ...selectedFirm, bank: activeBank }}
                  invoiceType={invoiceType}
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  placeOfSupply={placeOfSupply}
                  isSharda={isSharda}
                  totalAmount={totalAmount}
                  totalAmountWithTax={totalAmountWithTax}
                  taxableValue={taxableValue}
                  igstAmount={igstAmount}
                  cgstAmount={cgstAmount}
                  sgstAmount={sgstAmount}
                  numberToWordsIndian={numberToWordsIndian}
                  onImagesLoaded={() => setImagesReady(true)}
                  showGSTIN={showGSTIN}
                  notes={notesPage1}
                />

                {page2Items.length > 0 && (
                  <InvoicePage
                    pageNumber={2}
                    itemsOnPage={page2Items}
                    offset={offsetPage2}
                    isLastPage={true}
                    customer={customer}
                    selectedFirm={{ ...selectedFirm, bank: activeBank }}
                    invoiceType={invoiceType}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    placeOfSupply={placeOfSupply}
                    isSharda={isSharda}
                    totalAmount={totalAmount}
                    totalAmountWithTax={totalAmountWithTax}
                    taxableValue={taxableValue}
                    igstAmount={igstAmount}
                    cgstAmount={cgstAmount}
                    sgstAmount={sgstAmount}
                    numberToWordsIndian={numberToWordsIndian}
                    onImagesLoaded={() => setImagesReady(true)}
                    notes={notesPage2}
                    showGSTIN={showGSTIN}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create client modal */}
      {createClientOpen && (
        <CreateClientModal
          client={draftClient}
          onClose={() => {
            setCreateClientOpen(false);
            setDraftClient(null);
          }}
          onCreate={handleCreateClient}
        />
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Item
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Enter item description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Qty / Rate / Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={newItem.qty}
                    onChange={(e) =>
                      setNewItem({ ...newItem, qty: Number(e.target.value) })
                    }
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate
                  </label>
                  <input
                    type="number"
                    value={newItem.rate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, rate: Number(e.target.value) })
                    }
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    readOnly
                    value={`₹${(newItem.qty * newItem.rate).toFixed(2)}`}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
