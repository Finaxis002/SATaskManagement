import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaSync } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";
import Swal from "sweetalert2";

// ─── Eye Component (handles all 4 states) + tears drip from eye ──────────────
const Eye = ({ bgColor, pupilColor, size, mousePos, charRef, state, tearColor, tearDelay = 0 }) => {
  const [off, setOff] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (state !== "idle") { setOff({ x: 0, y: 0 }); return; }
    if (!charRef?.current) return;
    const r = charRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    const d = Math.hypot(dx, dy) || 1;
    setOff({ x: (dx / d) * 4, y: (dy / d) * 4 });
  }, [mousePos, charRef, state]);

  const isHiding  = state === "hiding";
  const isShocked = state === "shocked";
  const isCrying  = state === "crying";

  const eyeW = isShocked ? size * 1.5 : size;
  const eyeH = isHiding  ? 3
             : isShocked ? size * 1.5
             : isCrying  ? size * 0.45
             : size;
  const pupilSize = isShocked ? size * 0.75 : size * 0.45;

  return (
    // Outer wrapper: position:relative so tear is anchored to eye bottom-center
    <div style={{ position: "relative", flexShrink: 0, display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      {/* Eye ball */}
      <div style={{
        width: eyeW,
        height: eyeH,
        borderRadius: isCrying ? `0 0 ${size}px ${size}px`  // droopy bottom-rounded = sad squint
                   : isHiding  ? 2
                   : "50%",
        backgroundColor: isCrying ? bgColor : isHiding ? pupilColor : bgColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.34,1.4,0.64,1)",
        flexShrink: 0,
      }}>
        {!isHiding && (
          <div style={{
            width: isCrying ? size * 0.25 : pupilSize,
            height: isCrying ? size * 0.25 : pupilSize,
            borderRadius: "50%",
            backgroundColor: pupilColor,
            transform: isCrying ? "none" : `translate(${off.x}px, ${off.y}px)`,
            transition: "transform 0.08s ease-out, width 0.2s, height 0.2s",
            flexShrink: 0,
          }} />
        )}
      </div>

      {/* Tear — anchored right below eye center */}
      {isCrying && (
        <div style={{
          position: "absolute",
          top: eyeH - 1,           // starts at eye bottom
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.max(3, size * 0.28),
          height: Math.max(6, size * 0.7),
          borderRadius: "50% 50% 60% 60% / 20% 20% 80% 80%",
          backgroundColor: tearColor || "rgba(100,180,255,0.88)",
          animation: `tearFall 1.0s ease-in ${tearDelay}s infinite`,
          zIndex: 20,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
};

// ─── Characters Scene ─────────────────────────────────────────────────────────
const CharactersScene = ({ pwState }) => {
  const [mp, setMp] = useState({ x: -999, y: -999 });
  const oRef = useRef(null);
  const pRef = useRef(null);
  const bRef = useRef(null);
  const yRef = useRef(null);

  const isCrying = pwState === "crying";

  useEffect(() => {
    const h = (e) => setMp({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <>
      <style>{`
        @keyframes bobO { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes bobP { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-11px)} }
        @keyframes bobB { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes bobY { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }

        @keyframes sobO { 0%,100%{transform:translateY(0px)} 25%{transform:translateY(-4px) rotate(-3deg)} 75%{transform:translateY(-4px) rotate(3deg)} }
        @keyframes sobP { 0%,100%{transform:translateY(0px)} 30%{transform:translateY(-5px) rotate(3deg)} 70%{transform:translateY(-5px) rotate(-3deg)} }
        @keyframes sobB { 0%,100%{transform:translateY(0px)} 25%{transform:translateY(-3px) rotate(-2deg)} 75%{transform:translateY(-3px) rotate(2deg)} }
        @keyframes sobY { 0%,100%{transform:translateY(0px)} 30%{transform:translateY(-4px) rotate(2deg)} 70%{transform:translateY(-4px) rotate(-2deg)} }

        @keyframes tearFall {
          0%   { transform:translateX(-50%) translateY(0px) scaleY(1);    opacity:0.95; }
          70%  { transform:translateX(-50%) translateY(22px) scaleY(1.3); opacity:0.8; }
          100% { transform:translateX(-50%) translateY(34px) scaleY(0.4); opacity:0; }
        }

        @keyframes enterP {
          0%   { transform:translateY(-340px) scale(0.8); border-radius:50%;  width:90px;  height:90px;  opacity:0; }
          25%  { transform:translateY(-340px) scale(1);   border-radius:50%;  width:90px;  height:90px;  opacity:1; }
          52%  { transform:translateY(14px)   scale(1);   border-radius:50%;  width:90px;  height:90px; }
          62%  { transform:translateY(-4px)   scale(1);   border-radius:50%;  width:90px;  height:90px; }
          70%  { transform:translateY(0px)    scale(1);   border-radius:50%;  width:90px;  height:90px; }
          85%  { transform:translateY(0px)    scale(1);   border-radius:0;    width:118px; height:265px; }
          93%  { transform:translateY(-6px)   scale(1);   border-radius:0;    width:118px; height:265px; }
          100% { transform:translateY(0px)    scale(1);   border-radius:0;    width:118px; height:265px; }
        }
        @keyframes enterO {
          0%   { transform:translateY(-300px) scale(0.8); border-radius:8px 8px 0 0;     width:110px; height:190px; opacity:0; }
          25%  { transform:translateY(-300px) scale(1);   border-radius:8px 8px 0 0;     width:110px; height:190px; opacity:1; }
          52%  { transform:translateY(14px)   scale(1);   border-radius:8px 8px 0 0;     width:110px; height:190px; }
          62%  { transform:translateY(-4px)   scale(1);   border-radius:8px 8px 0 0;     width:110px; height:190px; }
          70%  { transform:translateY(0px)    scale(1);   border-radius:8px 8px 0 0;     width:110px; height:190px; }
          85%  { transform:translateY(0px)    scale(1);   border-radius:115px 115px 0 0; width:230px; height:115px; }
          93%  { transform:translateY(-5px)   scale(1);   border-radius:115px 115px 0 0; width:230px; height:115px; }
          100% { transform:translateY(0px)    scale(1);   border-radius:115px 115px 0 0; width:230px; height:115px; }
        }
        @keyframes enterB {
          0%   { transform:translateY(-280px) scale(0.8); border-radius:50%; width:90px; height:90px;  opacity:0; }
          25%  { transform:translateY(-280px) scale(1);   border-radius:50%; width:90px; height:90px;  opacity:1; }
          52%  { transform:translateY(12px)   scale(1);   border-radius:50%; width:90px; height:90px; }
          62%  { transform:translateY(-3px)   scale(1);   border-radius:50%; width:90px; height:90px; }
          70%  { transform:translateY(0px)    scale(1);   border-radius:50%; width:90px; height:90px; }
          85%  { transform:translateY(0px)    scale(1);   border-radius:0;   width:90px; height:185px; }
          93%  { transform:translateY(-5px)   scale(1);   border-radius:0;   width:90px; height:185px; }
          100% { transform:translateY(0px)    scale(1);   border-radius:0;   width:90px; height:185px; }
        }
        @keyframes enterY {
          0%   { transform:translateY(-260px) scale(0.8); border-radius:8px;           width:100px; height:100px; opacity:0; }
          25%  { transform:translateY(-260px) scale(1);   border-radius:8px;           width:100px; height:100px; opacity:1; }
          52%  { transform:translateY(12px)   scale(1);   border-radius:8px;           width:100px; height:100px; }
          62%  { transform:translateY(-3px)   scale(1);   border-radius:8px;           width:100px; height:100px; }
          70%  { transform:translateY(0px)    scale(1);   border-radius:8px;           width:100px; height:100px; }
          85%  { transform:translateY(0px)    scale(1);   border-radius:50px 50px 0 0; width:100px; height:200px; }
          93%  { transform:translateY(-5px)   scale(1);   border-radius:50px 50px 0 0; width:100px; height:200px; }
          100% { transform:translateY(0px)    scale(1);   border-radius:50px 50px 0 0; width:100px; height:200px; }
        }
        @keyframes fadeSlideDown {
          0%   { transform:translateY(-20px); opacity:0; }
          100% { transform:translateY(0px);   opacity:1; }
        }
        @keyframes fadeInEyes {
          0%,72% { opacity:0; transform:scale(0.4); }
          85%    { opacity:1; transform:scale(1.2); }
          100%   { opacity:1; transform:scale(1); }
        }
        .char-eyes-p { animation: fadeInEyes 0.5s cubic-bezier(0.34,1.5,0.64,1) 1.55s both; }
        .char-eyes-o { animation: fadeInEyes 0.5s cubic-bezier(0.34,1.5,0.64,1) 1.80s both; }
        .char-eyes-b { animation: fadeInEyes 0.5s cubic-bezier(0.34,1.5,0.64,1) 2.00s both; }
        .char-eyes-y { animation: fadeInEyes 0.5s cubic-bezier(0.34,1.5,0.64,1) 2.20s both; }

        /* Wobbly sad mouth for crying */
        @keyframes mouthQuiver {
          0%,100% { transform:translateX(-50%) scaleX(1);   }
          40%     { transform:translateX(-50%) scaleX(0.85); }
          70%     { transform:translateX(-50%) scaleX(1.1);  }
        }
        .mouth-cry { animation: mouthQuiver 0.6s ease-in-out infinite; }

        /* Shake whole scene on login fail */
        @keyframes shakeScene {
          0%,100% { transform:translateX(0); }
          15%     { transform:translateX(-8px); }
          30%     { transform:translateX(8px); }
          45%     { transform:translateX(-6px); }
          60%     { transform:translateX(6px); }
          75%     { transform:translateX(-3px); }
          90%     { transform:translateX(3px); }
        }
        .scene-shake { animation: shakeScene 0.5s ease-out; }
      `}</style>

      <div style={{ position: "relative", width: "100%", height: 300, overflow: "visible" }}>

        {/* ══ BLUE/PURPLE — straight rectangle ══ */}
        <div ref={pRef} style={{
          position: "absolute", bottom: 0, left: "26%",
          width: 118, height: 265,
          backgroundColor: "#4F6EF7", borderRadius: "0px", zIndex: 1,
          animation: isCrying
            ? "enterP 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.1s both, sobP 1.1s ease-in-out infinite"
            : "enterP 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.1s both, bobP 3.5s ease-in-out 1.8s infinite",
        }}>
          <div className="char-eyes-p" style={{
            position: "absolute", top: "14%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 10, opacity: 0,
          }}>
            <Eye bgColor="white" pupilColor="#1a1a1a" size={14} mousePos={mp} charRef={pRef} state={pwState} tearColor="rgba(180,210,255,0.92)" tearDelay={0} />
            <Eye bgColor="white" pupilColor="#1a1a1a" size={14} mousePos={mp} charRef={pRef} state={pwState} tearColor="rgba(180,210,255,0.92)" tearDelay={0.55} />
          </div>
          {/* Mouth */}
          {isCrying ? (
            <div className="mouth-cry" style={{
              position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)",
              width: 20, height: 9, borderTop: "2.5px solid rgba(255,255,255,0.9)",
              borderRadius: "10px 10px 0 0",
            }} />
          ) : (
            <div className="char-eyes-p" style={{
              position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)",
              width: 18, height: 7, borderBottom: "2px solid rgba(255,255,255,0.5)", borderRadius: "0 0 10px 10px", opacity: 0,
            }} />
          )}
        </div>

        {/* ══ ORANGE — half-circle ══ */}
        <div ref={oRef} style={{
          position: "absolute", bottom: 0, left: "-3%",
          width: 230, height: 115,
          backgroundColor: "#F07028", borderRadius: "115px 115px 0 0", zIndex: 2,
          animation: isCrying
            ? "enterO 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.35s both, sobO 1.2s ease-in-out infinite"
            : "enterO 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.35s both, bobO 3.2s ease-in-out 2.0s infinite",
        }}>
          <div className="char-eyes-o" style={{
            position: "absolute", top: "22%", left: "58%", transform: "translateX(-50%)",
            display: "flex", gap: 13, opacity: 0,
          }}>
            <Eye bgColor="white" pupilColor="#1a1a1a" size={16} mousePos={mp} charRef={oRef} state={pwState} tearColor="rgba(255,220,120,0.92)" tearDelay={0.2} />
            <Eye bgColor="white" pupilColor="#1a1a1a" size={16} mousePos={mp} charRef={oRef} state={pwState} tearColor="rgba(255,220,120,0.92)" tearDelay={0.75} />
          </div>
          {/* Mouth */}
          {isCrying ? (
            <div className="mouth-cry" style={{
              position: "absolute", top: "55%", left: "58%", transform: "translateX(-50%)",
              width: 28, height: 12, borderTop: "2.5px solid #1a1a1a",
              borderRadius: "14px 14px 0 0",
            }} />
          ) : (
            <div className="char-eyes-o" style={{
              position: "absolute", top: "58%", left: "58%", transform: "translateX(-50%)",
              width: 26, height: 10, borderBottom: "2.5px solid #1a1a1a", borderRadius: "0 0 50px 50px", opacity: 0,
            }} />
          )}
        </div>

        {/* ══ BLACK — straight rectangle ══ */}
        <div ref={bRef} style={{
          position: "absolute", bottom: 0, left: "44%",
          width: 90, height: 185,
          backgroundColor: "#1C1C1C", borderRadius: "0px", zIndex: 3,
          animation: isCrying
            ? "enterB 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.55s both, sobB 0.9s ease-in-out infinite"
            : "enterB 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.55s both, bobB 3.2s ease-in-out 2.2s infinite",
        }}>
          <div className="char-eyes-b" style={{
            position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 9, opacity: 0,
          }}>
            <Eye bgColor="white" pupilColor="#1a1a1a" size={12} mousePos={mp} charRef={bRef} state={pwState} tearColor="rgba(160,200,255,0.9)" tearDelay={0.4} />
            <Eye bgColor="white" pupilColor="#1a1a1a" size={12} mousePos={mp} charRef={bRef} state={pwState} tearColor="rgba(160,200,255,0.9)" tearDelay={0.9} />
          </div>
          {/* Mouth */}
          {isCrying ? (
            <div className="mouth-cry" style={{
              position: "absolute", top: "32%", left: "50%", transform: "translateX(-50%)",
              width: 20, height: 10,
              borderTop: "2.5px solid rgba(255,255,255,0.85)",
              borderRadius: "10px 10px 0 0",
            }} />
          ) : (
            <div className="char-eyes-b" style={{
              position: "absolute", top: "32%", left: "50%", transform: "translateX(-50%)",
              width: 16, height: 2.5, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 2, opacity: 0,
            }} />
          )}
        </div>

        {/* ══ YELLOW — tall dome ══ */}
        <div ref={yRef} style={{
          position: "absolute", bottom: 0, left: "62%",
          width: 100, height: 200,
          backgroundColor: "#F5C518", borderRadius: "50px 50px 0px 0px", zIndex: 4,
          animation: isCrying
            ? "enterY 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.75s both, sobY 1.0s ease-in-out infinite"
            : "enterY 1.4s cubic-bezier(0.34,1.2,0.64,1) 0.75s both, bobY 3.2s ease-in-out 2.4s infinite",
        }}>
          <div className="char-eyes-y" style={{
            position: "absolute", top: "28%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 10, opacity: 0,
          }}>
            <Eye bgColor="#1a1a1a" pupilColor="white" size={13} mousePos={mp} charRef={yRef} state={pwState} tearColor="rgba(255,230,60,0.95)" tearDelay={0.1} />
            <Eye bgColor="#1a1a1a" pupilColor="white" size={13} mousePos={mp} charRef={yRef} state={pwState} tearColor="rgba(255,230,60,0.95)" tearDelay={0.65} />
          </div>
          {/* Mouth */}
          {isCrying ? (
            <div className="mouth-cry" style={{
              position: "absolute", top: "42%", left: "50%", transform: "translateX(-50%)",
              width: 22, height: 10, borderTop: "2.5px solid #1a1a1a",
              borderRadius: "12px 12px 0 0",
            }} />
          ) : (
            <div className="char-eyes-y" style={{
              position: "absolute", top: "44%", left: "50%", transform: "translateX(-50%)",
              width: 22, height: 2.5, backgroundColor: "#1a1a1a", borderRadius: 2, opacity: 0,
            }} />
          )}
        </div>

      </div>
    </>
  );
};

// ─── Login Page ───────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [remember, setRemember] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);   // ← NEW
  const [shaking, setShaking] = useState(false);           // ← NEW
  const sceneRef = useRef(null);
  const dispatch = useDispatch();

  // 4 States:
  // "crying"  → login failed (stays until correct credentials)
  // "hiding"  → password field focused + password hidden
  // "shocked" → password visible
  // "idle"    → default
  const pwState = loginFailed   ? "crying"
    : passwordVisible           ? "shocked"
    : pwFocused                 ? "hiding"
    : "idle";

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let c = "";
    for (let i = 0; i < 6; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaText(c);
    setUserCaptchaInput("");
  };

  useEffect(() => { generateCaptcha(); }, []);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Reset crying when user starts editing after a failed login
  const handleFormChange = (e) => {
    handleChange(e);
    if (loginFailed) setLoginFailed(false);
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const computeIsToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso), t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (userCaptchaInput !== captchaText) {
      triggerShake();
      setLoginFailed(true);
      Swal.fire({ icon: "warning", title: "Invalid CAPTCHA", text: "Please enter the correct CAPTCHA code.", confirmButtonColor: "#1a1a1a" });
      setLoading(false);
      generateCaptcha();
      return;
    }
    try {
      const response = await axios.post("https://taskbe.sharda.co.in/api/employees/login", {
        ...formData, captchaToken: "manual-captcha-verified",
      });
      const { token, _id, name, role, email, position, department, userId, birthdate, isBirthdayToday } = response.data;
      const birthdayFlag = typeof isBirthdayToday === "boolean" ? isBirthdayToday : computeIsToday(birthdate);
      const loginExpiryTime = Date.now() + 10 * 60 * 60 * 1000;
      const rawDept = Array.isArray(department) ? department[0] : department;
      const nd = (rawDept || "").toLowerCase().trim();
      const deptValue = nd === "sales" || nd === "selles" ? "sales"
        : ["it", "it/software", "information technology"].includes(nd) ? "it/software" : nd;

      const userData = { _id, name, email, position, department: deptValue, userId, role, birthdate: birthdate || "", isBirthdayToday: birthdayFlag };
      localStorage.setItem("authToken", token);
      localStorage.setItem("loginExpiry", loginExpiryTime);
      localStorage.setItem("tokenLocal", token);
      localStorage.setItem("triggerLoginReminder", "true");
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", _id);
      localStorage.setItem("email", email);
      localStorage.setItem("department", deptValue);
      localStorage.setItem("birthdate", birthdate || "");
      localStorage.setItem("isBirthdayToday", JSON.stringify(!!birthdayFlag));
      dispatch(setAuth({ name, role, userId: _id, birthdate: birthdate || "", isBirthdayToday: !!birthdayFlag }));

      setLoginFailed(false); // clear crying on success

      try {
        const res = await axios.get("https://taskbe.sharda.co.in/api/linkedemails");
        const match = (res.data?.data || []).find(i => i.linkedUserIds.includes(userId));
        if (match?.email) localStorage.setItem("googleEmail", match.email);
        else localStorage.removeItem("googleEmail");
      } catch { localStorage.removeItem("googleEmail"); }

      navigate("/", { replace: true });
    } catch (err) {
      // ← Trigger crying + shake on wrong password
      triggerShake();
      setLoginFailed(true);
      Swal.fire({ icon: "error", title: "Login Failed", text: err.response?.data?.message || "Invalid User ID or Password.", confirmButtonColor: "#1a1a1a", timerProgressBar: true });
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .login-input {
          width: 100%; border: none; border-bottom: 1.5px solid #ddd;
          outline: none; font-size: 15px; color: #1a1a1a;
          padding: 8px 0; background: transparent;
          font-family: 'Outfit', sans-serif; transition: border-color 0.2s;
        }
        .login-input:focus { border-bottom-color: #1a1a1a; }
        .login-input::placeholder { color: #bbb; }
        .login-btn {
          width: 100%; padding: 14px; background: #1a1a1a; color: white;
          border: none; border-radius: 100px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em; transition: background 0.2s, transform 0.1s;
        }
        .login-btn:hover:not(:disabled) { background: #333; transform: scale(1.01); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .remember-checkbox {
          appearance: none; width: 15px; height: 15px; border: 1.5px solid #ccc;
          border-radius: 4px; cursor: pointer; position: relative;
          transition: all 0.15s; flex-shrink: 0; margin-top: 1px;
        }
        .remember-checkbox:checked { background: #1a1a1a; border-color: #1a1a1a; }
        .remember-checkbox:checked::after {
          content: ''; position: absolute; left: 3px; top: 0px;
          width: 5px; height: 9px; border: 2px solid white;
          border-left: none; border-top: none; transform: rotate(45deg);
        }
        @media (max-width: 768px) {
          .split-left { display: none !important; }
          .split-right { padding: 40px 28px !important; }
        }
        @keyframes shakeScene {
          0%,100% { transform:translateX(0); }
          15%     { transform:translateX(-10px); }
          30%     { transform:translateX(10px); }
          45%     { transform:translateX(-7px); }
          60%     { transform:translateX(7px); }
          75%     { transform:translateX(-4px); }
          90%     { transform:translateX(4px); }
        }
        .scene-shake { animation: shakeScene 0.5s ease-out !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Outfit', sans-serif", backgroundColor: "#eceae6" }}>

        {/* ── LEFT ── */}
        <div className="split-left" style={{
          flex: "1 1 55%", backgroundColor: "#e4e1dc",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "48px 32px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 28, left: 36,
            display: "flex", alignItems: "center", gap: 10,
            animation: "fadeSlideDown 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both",
          }}>
            <img src="/SALOGO.png" alt="ASA" style={{ width: 38, height: 38, objectFit: "contain", filter: "invert(1)" }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.02em" }}>
              Anunay Sharda &amp; Associates
            </span>
          </div>

          {/* Scene wrapper — shake class applied here */}
          <div ref={sceneRef} className={shaking ? "scene-shake" : ""} style={{ width: "100%", maxWidth: 480, marginTop: 20 }}>
            <CharactersScene pwState={pwState} />
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ fontSize: 21, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
              {loginFailed ? "Uh oh! Wrong password 😢" : "Your work, simplified."}
            </p>
            <p style={{ fontSize: 13, color: "#999", marginTop: 5 }}>
              {loginFailed ? "They're crying until you get it right..." : "Task management built for your team."}
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="split-right" style={{
          flex: "1 1 45%", backgroundColor: "#fff",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "48px 56px", position: "relative",
        }}>
          <span style={{ position: "absolute", top: 28, right: 40, fontSize: 28, fontWeight: 900, color: "#1a1a1a", userSelect: "none" }}>✦</span>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: 6, textAlign: "center" }}>Welcome back!</h1>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 36, textAlign: "center" }}>Please enter your details</p>

          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360 }}>

            {/* User ID */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>User ID</label>
              <input className="login-input" type="text" name="userId" placeholder="Enter your user ID" value={formData.userId} onChange={handleFormChange} required />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12, position: "relative" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Password</label>
              <input
                className="login-input"
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleFormChange}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                required
                style={{ paddingRight: 28 }}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{ position: "absolute", right: 0, bottom: 8, background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0 }}
              >
                {passwordVisible ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>

            {/* Remember for 30 days */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 28 }}>
              <input type="checkbox" id="remember" className="remember-checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <label htmlFor="remember" style={{ fontSize: 13, color: "#888", cursor: "pointer", userSelect: "none" }}>
                Remember for 30 days
              </label>
            </div>

            {/* Captcha */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#999", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Captcha</label>
              <div style={{ background: "#f7f6f3", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, letterSpacing: "0.18em", color: "#1a1a1a", userSelect: "none" }}>{captchaText}</span>
                <button type="button" onClick={generateCaptcha} style={{ background: "#1a1a1a", color: "white", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex" }}>
                  <FaSync size={12} />
                </button>
              </div>
              <input className="login-input" type="text" placeholder="Enter the code above" value={userCaptchaInput} onChange={(e) => { setUserCaptchaInput(e.target.value); if (loginFailed) setLoginFailed(false); }} required />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 1s linear infinite" }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Signing in...
                  </span>
                : "Log in"
              }
            </button>
          </form>

          <p style={{ position: "absolute", bottom: 20, fontSize: 11, color: "#ccc", textAlign: "center" }}>
            © {new Date().getFullYear()} Anunay Sharda Associates. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;