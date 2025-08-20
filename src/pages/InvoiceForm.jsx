import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import CreatableSelect from "react-select/creatable";
import "../css/InvoiceForm.css";
import axios from "../utils/secureAxios";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { FiSave, FiDownload } from "react-icons/fi";
import InvoicePage from "../Components/invoice/InvoicePage";
import CreateClientModal from "../Components/client/CreateClientModal";

const ITEMS_PER_PAGE = 8;

const invoiceTypes = ["Proforma Invoice", "Tax Invoice", "Invoice"];

export default function InvoiceForm() {
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
  const [draftClient, setDraftClient] = useState(null); // { name?: string, ... }

  useEffect(() => {
    const loadFirms = async () => {
      try {
        setFirmsLoading(true);
        const res = await axios.get("https://taskbe.sharda.co.in/firms"); // baseURL in secureAxios handles domain
        setFirms(res.data || []);
        if ((res.data || []).length) {
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
    setInvoiceNumber("");
    setIsFinalized(false);
    if (selectedFirm && invoiceType) previewInvoiceNumber();
  }, [selectedFirmId, invoiceType]);

  const previewInvoiceNumber = async () => {
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
    if (selectedFirm && invoiceType) previewInvoiceNumber();
  }, [selectedFirm, invoiceType]);

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

  // const [selectedClientOption, setSelectedClientOption] = useState(null);

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
    if (selectedFirm && invoiceType) {
      previewInvoiceNumber();
    }
  }, [selectedFirm, invoiceType]);

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

  // const handleDownloadPDF = async () => {
  //   try {
  //     const finalNo = await finalizeInvoiceNumber(); // if you want locking
  //     setInvoiceNumber(finalNo);
  //     if (!invoiceRef.current) return;
  //     const element = invoiceRef.current;
  //     // Temporarily remove scale before PDF generation
  //     element.style.transform = "scale(1)";
  //     element.style.transformOrigin = "top left";
  //     element.style.width = `${element.scrollWidth}px`;

  //     // Make sure element is attached to DOM and visible
  //     if (!document.body.contains(element)) {
  //       document.body.appendChild(element);
  //     }
  //     // Add CSS for page margins

  //     const opt = {
  //       margin: 0,
  //       padding: 0,
  //       filename: `${invoiceNumber}.pdf`,
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: {
  //         scale: 2,
  //         dpi: 300,
  //         letterRendering: true,
  //         useCORS: true,
  //         width: element.scrollWidth, // Explicitly set width
  //         windowWidth: element.scrollWidth, // Match window width
  //       },
  //       jsPDF: {
  //         unit: "px",
  //         // format: "a4",
  //         orientation: "portrait",
  //         format: [794, 1122],
  //       },
  //       pagebreak: { mode: "css" },
  //     };

  //     // Add this to ensure proper scaling
  //     element.style.width = `${element.scrollWidth}px`;

  //     // html2pdf().set(opt).from(element).save();
  //     html2pdf()
  //       .set(opt)
  //       .from(element)
  //       .save()
  //       .then(() => {
  //         // Restore scale after PDF is generated

  //         element.style.transform = "scale(0.75)";
  //         element.style.transformOrigin = "top left";
  //         element.style.width = "";
  //       });

  //     // Reset the width after PDF generation if needed
  //     setTimeout(() => {
  //       element.style.width = "";
  //     }, 2000);
  //   } catch (error) {
  //     alert("Could not finalize invoice number.");
  //   }
  // };

  // const saveInvoice = async () => {
  //   try {
  //     const finalNo = await finalizeInvoiceNumber();

  //     const invoiceData = {
  //       invoiceNumber: finalNo,
  //       invoiceDate,
  //       invoiceType,
  //       selectedFirm,
  //       placeOfSupply,
  //       customer,
  //       items,
  //       totalAmount: totalAmountWithTax,
  //     };
  //     await axios.post("/invoices", invoiceData);
  //     // Display an alert once the invoice is saved successfully
  //     Swal.fire({
  //       icon: "success",
  //       title: "Invoice Saved",
  //       text: `Invoice ${invoiceNumber} has been successfully saved.`,
  //       confirmButtonColor: "#3085d6",
  //       confirmButtonText: "Ok",
  //     });
  //   } catch (error) {
  //     console.error("Failed to save invoice", error);
  //     alert("Failed to save invoice");
  //   }
  // };

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
        pagebreak: { mode: "css" },
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

  return (
    <div
      className="invoice-page"
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        flexWrap: "wrap",
        justifyContent: "center",
        background: "#f9f9f9",
      }}
    >
      {/* Left form side */}
      <div
        className="invoice-left scrollable-panel "
        style={{ flex: "1 1 550px", maxWidth: 500 }}
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
          <button
            onClick={handleSaveAndDownloadPDF}
            title="Save and Download PDF"
            className="group mb-3 relative px-4 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <FiSave className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Save & Generate PDF</span>
            <FiDownload className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1" />
          </button>
        </div>

        <div className="space-y-1">
          {/* Date Range */}
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
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setSelectedBankIndex(parseInt(e.target.value))}
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
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {/* <Select
              options={clientOptions}
              value={clientOptions.find(
                (option) => option.value === customer._id
              )}
              onChange={(option) => setSelectedClientOption(option)}
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
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "#1a73e8",
                },
              })}
            /> */}
            <CreatableSelect
              options={clientOptions}
              value={selectedClientOption}
              onChange={(option) => setSelectedClientOption(option)}
              onCreateOption={openCreateClientModal} // 👈 shows “+ Add client …”
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
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Notes</h2>

            {notes.length === 0 && (
              <div className="text-sm text-gray-500 mb-2">
                Add your first note for this invoice.
              </div>
            )}

            {notes.map((n, idx) => (
              <div
                key={n.id}
                className="border border-gray-300 rounded-lg p-3 mb-2 bg-white shadow-sm"
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

      <div
        className="invoice-right screen-preview"
        ref={invoiceRef}
        style={{
          backgroundColor: "#fff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: 12,
          color: "#000",
          transform: "scale(0.90)", // visually shrink
          transformOrigin: "top left",
          position: "relative",
          width: "794px",
        }}
      >
        <div ref={invoiceRef}>
          <InvoicePage
            pageNumber={1}
            itemsOnPage={page1Items}
            offset={offsetPage1}
            isLastPage={page2Items.length === 0}
            customer={customer}
            // selectedFirm={{
            //   ...selectedFirm,
            //   bank:
            //     selectedFirm?.name === "Sharda Associates"
            //       ? selectedFirm?.banks[selectedBankIndex]
            //       : selectedFirm?.bank,
            // }}
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
            notes={notes}
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
              notes={notes}
            />
          )}
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
  );
}
