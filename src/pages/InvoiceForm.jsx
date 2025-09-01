import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import CreatableSelect from "react-select/creatable";
import "../css/InvoiceForm.css";
import axios from "../utils/secureAxios";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { FiSave, FiDownload } from "react-icons/fi";
import InvoicePage from "../Components/invoice/InvoicePage";
import CreateClientModal from "../Components/client/CreateClientModal";
// import axios from "axios";

const ITEMS_PER_PAGE = 8;

const invoiceTypes = ["Proforma Invoice", "Tax Invoice", "Invoice"];


// Use the function


export default function InvoiceForm({
  initialInvoice = null,
  onSaved,
  onClose,
}) {
  
  const PREVIEW_W = 794;
  const PREVIEW_H = 1122;
  const PREVIEW_SCALE = 0.9;
  const [previewScale, setPreviewScale] = useState(0.9);
  const previewWrapRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const el = previewWrapRef.current;
      if (!el) return;
      const avail = el.clientWidth - 16; // padding
      setPreviewScale(Math.min(1, avail / PREVIEW_W));
    };

    update();

    const ro = new ResizeObserver(update);
    const el = previewWrapRef.current;
    if (el) ro.observe(el); // <-- guard!

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const isEdit = !!initialInvoice;
  const [firms, setFirms] = useState([]);
  const [selectedFirmId, setSelectedFirmId] = useState("");
  // const [selectedFirm, setSelectedFirm] = useState(null);
  const [firmsLoading, setFirmsLoading] = useState(true);
  const [firmsError, setFirmsError] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedFirm, setSelectedFirm] = useState(firms[0]);
  const [invoiceType, setInvoiceType] = useState(invoiceTypes[0]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [selectedBankIndex, setSelectedBankIndex] = useState(0);
  const [notes, setNotes] = useState([]);
  const [selectedClientOption, setSelectedClientOption] = useState(null); // keep
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [draftClient, setDraftClient] = useState(null);
  

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
      setInvoiceNumber(""); // <-- important
      Swal.fire(
        "Couldn’t preview invoice number",
        "Check API URL/Network.",
        "warning"
      );
    }
  };

  // Finalize invoice number - increments DB (call only when saving)
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

  useEffect(() => {
    if (isEdit) return; // ⛔ no preview while editing
    setInvoiceNumber("");
    setIsFinalized(false);
    if (selectedFirm && invoiceType) previewInvoiceNumber();
  }, [isEdit, selectedFirmId, selectedFirm, invoiceType]);

  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [placeOfSupply, setPlaceOfSupply] = useState("Madhya Pradesh");
  const isLocalSupply = () => {
    const place = placeOfSupply.toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
  };
  const [customer, setCustomer] = useState({
    __id: "",
    name: "",
    address: "",
    GSTIN: "",
    mobile: "",
    emailId: "",
  });
  const [clients, setClients] = useState([]);
  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.name}${
      client.businessName ? ` (${client.businessName})` : ""
    }`,
  }));

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

  const invoiceRef = useRef();
  const isSharda = selectedFirm?.name === "Sharda Associates";

  const showGSTIN = !!selectedFirm?.gstin;

  const offsetPage1 = 0;
  const offsetPage2 = ITEMS_PER_PAGE;
  const originalInvNoRef = useRef("");

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log("Fetching clients..."); // Debug log
        const response = await axios.get("/clients/details");
        console.log("Clients fetched:", response.data); // Debug log
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        // Add error state if needed
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



  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // delete item
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
    setItems([
      ...items,
      { id: uuidv4(), description: "", hsn: "9971", qty: 1, rate: 0, gst: 0 },
    ]);
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

  const page1Items = items.slice(0, ITEMS_PER_PAGE);
  const page2Items = items.slice(ITEMS_PER_PAGE);

  const handleSaveAndDownloadPDF = async () => {
    try {
      // Finalize the invoice number and mark it as finalized
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
      // Save the invoice to the backend
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

      // Show save success alert
      await Swal.fire({
        icon: "success",
        title: "Invoice Saved",
        text: `Invoice ${finalNo} has been successfully saved.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });

      // Now generate PDF
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
        pagebreak: { mode: ['css', 'legacy'],
    avoid: '.invoice-note'},
      };

      await html2pdf().set(opt).from(element).save();

      // Reset styles
      element.style.transform = "scale(0.90)";
      element.style.transformOrigin = "top left";
      element.style.width = "";
    } catch (error) {
      console.error("Failed to save or generate PDF:", error);
      Swal.fire("Error", "Could not save or generate the invoice.", "error");
    }
  };

  // after selectedFirm & selectedBankIndex are set
  const activeBank =
    selectedFirm?.banks?.[selectedBankIndex] ??
    selectedFirm?.bank ?? // backward compat
    null;

  // Open the modal with the typed name prefilled
  const openCreateClientModal = (inputValue) => {
    setDraftClient({ name: inputValue }); // prefill modal
    setCreateClientOpen(true);
  };

  const handleCreateClient = async (formData) => {
    try {
      // POST to your existing API
      const res = await axios.post("/clients", formData);
      const newClient = res.data?.client;

      // add to local list so it appears in options
      setClients((prev) => [...prev, newClient]);

      // select it in the dropdown
      const label = `${newClient.name}${
        newClient.businessName ? ` (${newClient.businessName})` : ""
      }`;
      const option = { value: newClient._id, label };
      setSelectedClientOption(option);

      // also sync the `customer` snapshot used in the invoice (instant UX)
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

  // Preload on edit
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

  // Skip preview number in edit mode
  useEffect(() => {
    if (isEdit) return;
    if (selectedFirm && invoiceType) previewInvoiceNumber();
  }, [isEdit, selectedFirm, invoiceType]);

  // const updateInvoice = async () => {
  //   try {
  //     const firmSnapshot = {
  //       _id: selectedFirm?._id,
  //       name: selectedFirm?.name,
  //       address: selectedFirm?.address,
  //       phone: selectedFirm?.phone,
  //       gstin: selectedFirm?.gstin,
  //       bank: activeBank
  //         ? {
  //             _id: activeBank._id,
  //             label: activeBank.label || "",
  //             bankName: activeBank.bankName || activeBank.name || "",
  //             accountName: activeBank.accountName || "",
  //             accountNumber:
  //               activeBank.accountNumber || activeBank.account || "",
  //             ifsc: activeBank.ifsc || "",
  //             upiIdName: activeBank.upiIdName || "",
  //             upiMobile: activeBank.upiMobile || "",
  //             upiId: activeBank.upiId || "",
  //           }
  //         : null,
  //     };

  //     const payload = {
  //       invoiceNumber,
  //       invoiceDate,
  //       invoiceType, // ignored if changed (server freezes)
  //       selectedFirm: firmSnapshot, // bank allowed; rest frozen server-side
  //       placeOfSupply,
  //       customer, // frozen server-side
  //       items,
  //       notes,
  //       totalAmount: totalAmountWithTax,
  //     };

  //     // const { data } = await axios.put(`https://taskbe.sharda.co.in/api/invoices/${invoiceNumber}`, payload);
  //     const idForUpdate = isEdit ? originalInvNoRef.current : invoiceNumber;
  //     const { data } = await axios.put(
  //       `https://taskbe.sharda.co.in/api/invoices/${encodeURIComponent(
  //         idForUpdate
  //       )}`,
  //       payload
  //     );
  //     await Swal.fire("Updated", "Invoice saved successfully.", "success");
  //     onSaved && onSaved(data);
  //     onClose && onClose();
  //   } catch (e) {
  //     console.error(e);
  //     Swal.fire("Error", "Could not update the invoice.", "error");
  //   }
  // };

  const handleUpdateAndDownloadPDF = async () => {
    try {
      // 1) UPDATE the invoice in DB (no finalize here)
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
        invoiceType, // server freezes type if changed
        selectedFirm: firmSnapshot,
        placeOfSupply,
        customer, // frozen server-side
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

      // Optional toast
      await Swal.fire({
        icon: "success",
        title: "Invoice Updated",
        text: `Invoice ${invoiceNumber} has been updated. Generating PDF...`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });

      // 2) GENERATE the PDF (do NOT finalize/increment in edit mode)
      if (!invoiceRef.current) return;

      const element = invoiceRef.current;

      // remember current styles and temporarily un-scale
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

      // restore preview styles
      element.style.transform = prevTransform || `scale(${previewScale})`;
      element.style.transformOrigin = prevTransformOrigin || "top left";
      element.style.width = prevWidth || "";

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not update or generate the invoice.", "error");
    }
  };

  const calculateNotesPages = () => {
  if (notes.length === 0) return 0;
  
  // Simple estimation - you might need to adjust this based on your actual layout
  const approxLinesPerPage = 40;
  let totalLines = 0;
  
  notes.forEach(note => {
    // Estimate lines based on character count (assuming ~60 chars per line)
    const lines = Math.ceil(note.text.length / 60) + 1; // +1 for the number prefix
    totalLines += lines;
  });
  
  return Math.ceil(totalLines / approxLinesPerPage);
};





const splitNotesForPages = (notes, maxNotesPerPage = 5) => {
  if (notes.length === 0) return [[], []]; // Empty notes case

  // If all notes fit on one page, return them all for page 1
  if (notes.length <= maxNotesPerPage) return [notes, []];

  // Otherwise, split notes between pages
  return [notes.slice(0, maxNotesPerPage), notes.slice(maxNotesPerPage)];
};


// Calculate pages needed
const notesPages = calculateNotesPages();
const [notesPage1, notesPage2] = splitNotesForPages(notes); 

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
`}</style>
      <style>{`
  /* force two columns and prevent wrapping */
  .asa-row {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: flex-start !important;
    gap: 20px !important;
    padding: 20px !important;
    background: #f9f9f9 !important;
    overflow-x: auto !important; /* horizontal scroll if needed */
  }

  /* lock the left panel to a fixed column width (override width:100%) */
  .asa-left {
    flex: 0 0 520px !important;
    width: 520px !important;
    max-width: 520px !important;
    box-sizing: border-box !important;
  }

  /* right side is content-sized; never wraps */
  .asa-right {
    flex: 0 0 auto !important;
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
`}</style>
      ;
      <div
        className="invoice-page "
      
        style={{
          display: "flex",
          flexDirection: "row", // This ensures side-by-side layout
          gap: "20px",
          padding: "20px",
          background: "#f9f9f9",
          height: "calc(100vh - 40px)",
          overflowX: "auto",
          alignItems: "flex-start",
          overflow: "hidden",
          width: "100%", // Make it take full available width
          maxWidth: "none", // Remove any max-width constraints
        }}
      >
        {/* Left form side */}
        <div
          className="invoice-left scrollable-panel"
          style={{
            flex: "0 0 520px",
            maxWidth: "520px",
            minWidth: "520px",
            boxSizing: "border-box",
            height: "100%",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          {/* ... Your left side inputs and controls ... */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div className="flex gap-2 justify-center items-center mb-3">
              {/* {isEdit ? (
                <button
                  onClick={updateInvoice}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Invoice
                </button>
              ) : (
                <button
                  onClick={handleSaveAndDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  title="Save and Download PDF"
                >
                  Save & Generate PDF
                </button>
              )} */}
              <button
                onClick={
                  isEdit ? handleUpdateAndDownloadPDF : handleSaveAndDownloadPDF
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                title={
                  isEdit ? "Update and Download PDF" : "Save and Download PDF"
                }
              >
                <FiSave className="w-4 h-4" />
                <span>
                  {isEdit ? "Update & Download PDF" : "Save & Download PDF"}
                </span>
                <FiDownload className="w-4 h-4" />
              </button>

              {onClose && (
                <button onClick={onClose} className="px-4 py-2 border rounded">
                  Close
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {/* Date Range */}
            {!isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    max={toDate || undefined}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate || undefined}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {isEdit && (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600">
                    Invoice No.
                  </label>
                  <input
                    readOnly
                    value={invoiceNumber}
                    className={`mt-1 w-full border rounded-md px-3 py-2 shadow-sm 
                      ${
                        isEdit
                          ? "locked-field locked-cursor"
                          : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      }`}
                    aria-disabled={isEdit}
                    onMouseDown={(e) => {
                      if (isEdit) e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                      if (isEdit && !["Tab", "Shift", "Escape"].includes(e.key))
                        e.preventDefault();
                    }}
                  />
                </div>
              </div>
            )}

            {/* Firm Selection */}

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
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
                <select
                  value={selectedFirmId}
                  onChange={(e) => setSelectedFirmId(e.target.value)}
                  disabled={isEdit}
                  // className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className={`mt-1 w-full border rounded-md px-3 py-2 shadow-sm 
                    ${
                      isEdit
                        ? "locked-field locked-cursor"
                        : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }`}
                  aria-disabled={isEdit}
                  onMouseDown={(e) => {
                    if (isEdit) e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (isEdit && !["Tab", "Shift", "Escape"].includes(e.key))
                      e.preventDefault();
                  }}
                >
                  {firms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedFirm?.banks?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Bank Account
                </label>
                <select
                  value={selectedBankIndex}
                  onChange={(e) =>
                    setSelectedBankIndex(parseInt(e.target.value))
                  }
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedFirm?.banks?.map((bank, idx) => (
                    <option key={bank._id || idx} value={idx}>
                      {bank.label ||
                        `${bank.bankName || bank.name} - ${
                          bank.accountNumber || bank.account
                        }`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Invoice Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Type
                </label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  disabled={isEdit}
                  // className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  className={`mt-1 w-full border rounded-md px-3 py-2 shadow-sm 
                  ${
                    isEdit
                      ? "locked-field locked-cursor"
                      : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }`}
                  aria-disabled={isEdit}
                  onMouseDown={(e) => {
                    if (isEdit) e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (isEdit && !["Tab", "Shift", "Escape"].includes(e.key))
                      e.preventDefault();
                  }}
                >
                  {invoiceTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
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
                   }`}
                  aria-disabled={isEdit}
                  onMouseDown={(e) => {
                    if (isEdit) e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (isEdit && !["Tab", "Shift", "Escape"].includes(e.key))
                      e.preventDefault();
                  }}
                  title="Client is locked for existing invoice"
                />
              ) : (
                <CreatableSelect
                  options={clientOptions}
                  value={selectedClientOption}
                  onChange={(option) => setSelectedClientOption(option)}
                  onCreateOption={openCreateClientModal} // 👈 shows “+ Add client …”
                  formatCreateLabel={(inputValue) =>
                    `+ Add client "${inputValue}"`
                  }
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

            {/* Place of Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Place of Supply
              </label>
              <input
                placeholder="Place of Supply"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Items Section */}
            <div className="relative max-h-[60vh] overflow-y-auto pr-2">
              <h2 className="text-lg font-semibold text-gray-800">Items</h2>
              {items.map((item, idx) => {
                const amount = (item.qty * item.rate).toFixed(2);
                return (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded-lg p-4 mb-2 bg-white shadow-sm"
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(idx, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex flex-col sm:flex-row gap-4">
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
                        className="mt-6  transition text-red-500 hover:text-red-800"
                        title="Delete Task"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Item Button */}
              <div className="mt-4 sticky bottom-4 bg-white py-2 text-center">
                <button
                  onClick={addItem}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-4 notes-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
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

              {/* Add Note button BELOW the notes list */}
              <button
                onClick={addNote}
                className="w-50  bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm transition pt-0.5 text-center"
              >
                + Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Right side invoice preview */}
        {/* <div
          ref={previewWrapRef}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            overflow: "auto",
            maxHeight: "calc(100vh - 160px)",
            padding: 8,
            background: "#f3f4f6",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: PREVIEW_W * previewScale,
              height: PREVIEW_H * previewScale,
            }}
          ></div>
        </div> */}
        <div
          className="asa-right"
          ref={previewWrapRef}
          style={{
            flex: "1",
            height: "100%", // Take full height of parent
            overflowY: "auto", // Add vertical scrolling
            padding: "8px",
            background: "#f3f4f6",
            borderRadius: "8px",
          }}
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
              // style={{
              //   backgroundColor: "#fff",
              //   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              //   fontSize: 12,
              //   color: "#000",
              //   // transform: "scale(0.90)",
              //   // transformOrigin: "top left",
              //   position: "relative",
              //   // width: "794px",
              //   width: PREVIEW_W,
              //   height: PREVIEW_H,
              //   transform: `scale(${previewScale})`,
              //   transformOrigin: "top left",
              //   boxShadow: "0 0 0 1px #e5e7eb",
              // }}
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
                    // selectedFirm={selectedFirm}
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

        {/* create client modal */}
        {createClientOpen && (
          <CreateClientModal
            client={draftClient} // prefill name
            onClose={() => {
              setCreateClientOpen(false);
              setDraftClient(null);
            }}
            onCreate={handleCreateClient} // receives full formData
          />
        )}
      </div>
    </>
  );
}
