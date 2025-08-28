import finaxisLogo from "../../assets/Finaxis_logo.png";
import shardaLogo from "../../assets/ShardaLogo.png";
import footerImageFinaxis from "../../assets/LetterheadBottomFinaxis.jpg";
import headerImageFinaxis from "../../assets/headerImgFinaxis1.png";
import finaxisHeader from "../../assets/finaxis_header.png";
import shardaHeader from "../../assets/ShardaHeader.png";
import headerImageSharda from "../../assets/headerImgSharda.png";
import footerImageSharda from "../../assets/ShardaBottom.png";
import calogonew from "../../assets/New_CA_India_Logo.png";
import "../../css/InvoiceForm.css";

export default function InvoicePage({
  pageNumber,
  itemsOnPage,
  offset,
  isLastPage,
  customer,
  selectedFirm,
  invoiceType,
  invoiceNumber,
  invoiceDate,
  placeOfSupply,
  isSharda,
  totalAmount,
  totalAmountWithTax,
  taxableValue,
  igstAmount,
  cgstAmount,
  sgstAmount,
  numberToWordsIndian,
  showGSTIN,
  notes,
}) {
  
  const isFirm = (name) =>
    (selectedFirm?.name || "").toLowerCase() === name.toLowerCase();


  // Treat as GST invoice only if you actually want to show GST *and* the firm has a GSTIN
const isGSTFirm = !!(showGSTIN && selectedFirm?.gstin);

// Use total + tax when GST applies, otherwise just the plain total
const finalTotal = isGSTFirm ? totalAmountWithTax : totalAmount;

// Amount in words should follow what you finally charge
const amountInWords = numberToWordsIndian(finalTotal);

// Guard for placeOfSupply when GST is on
const isLocalSupply = () => {
  if (!isGSTFirm) return false; // doesn't matter if GST not applicable
  const place = (placeOfSupply || "").toLowerCase().replace(/\s+/g, "");
  return place === "mp" || place === "madhyapradesh";
};

  const headerStyle =
    pageNumber === 1
      ? { width: "100%", display: "block", height: "auto", marginBottom: 20 }
      : { width: "100%", display: "block", height: "auto" };

  const footerStyle =
    pageNumber === 1
      ? { width: "100%", display: "block", height: "auto", marginTop: 25 }
      : { width: "100%", display: "block", height: "auto", marginTop: 10 };

  const ITEMS_PER_PAGE = 8;

  const bank = selectedFirm?.bank || {};
  const bankName = bank.bankName || bank.name || "";
  const accountName = bank.accountName || "";
  const accountNumber = bank.accountNumber || bank.account || "";
  const ifsc = bank.ifsc || "";
  // UPI/wallet info from DB (your BankDetails screen already saves these)
  const upiIdName = bank.upiIdName || "";
  const upiMobile = bank.upiMobile || "";
  const upiId = bank.upiId || "";

  const getWalletInfo = () => {
    if (!upiIdName && !upiMobile && !upiId) return null;
    return (
      <>
        <strong>For Online Wallets - Paytm, Google Pay and PhonePe.</strong>
        <br />
        {upiIdName ? (
          <>
            Name - {upiIdName}
            <br />
          </>
        ) : null}
        {upiMobile ? (
          <>
            Mobile Number - {upiMobile}
            <br />
          </>
        ) : null}
        {upiId ? <>UPI ID - {upiId}</> : null}
      </>
    );
  };

  const notesToShow = Array.isArray(notes)
  ? notes
      .map(n => (typeof n === "string" ? { text: n } : n))
      .map(n => ({ ...n, text: (n?.text || "").trim() }))
      .filter(n => n.text.length)
  : typeof notes === "string"
  ? notes
      .split("\n")
      .map(s => ({ text: s.trim() }))
      .filter(n => n.text.length)
  : [];

    const isLastPg = pageNumber === Math.ceil((itemsOnPage.length + offset) / ITEMS_PER_PAGE);


  return (
    <div
      className="pdf-wrapper"
      style={{
        width: "794px",
        height: "1122px",
        margin: "0 auto",
        background: "#fff",
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Header */}
      <div
        style={{
          margin: 0,
          padding: 0,
        }}
      >
        {selectedFirm.name === "Sharda Associates" ? (
          <img
            className="header-image"
            src={headerImageSharda}
            alt="Invoice header"
            // style={{ width: "100%", display: "block", height: "auto" }}
            style={headerStyle}
          />
        ) : selectedFirm.name === "Anunay Sharda & Associates" ? (
          <img
            src={headerImageFinaxis}
            alt="Anunay Sharda & Associates"
            style={headerStyle}
          />
        ) : (
          <img
            className="header-image"
            src={headerImageFinaxis}
            alt="Invoice header"
            // style={{ width: "100%", display: "block", height: "auto" }}
            style={headerStyle}
          />
        )}
      </div>
      {/* invoice-container */}
      <div
        className="invoice-page-container invoice-content"
        style={{
          position: "relative",
        }}
      >
        {/* Watermark */}
        {selectedFirm.name === "Sharda Associates" ? (
          <img
            src={shardaLogo}
            alt="Watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "400px",
              height: "auto",
              opacity: 0.1,
              transform: "translate(-50%, -50%) ",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          />
        ) : selectedFirm.name === "Anunay Sharda & Associates" ? (
          <img
            src={calogonew}
            alt="Watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "400px",
              height: "auto",
              opacity: 0.1,
              transform: "translate(-50%, -50%) ",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          />
        ) : (
          <img
            src={finaxisLogo}
            alt="Watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "400px",
              height: "auto",
              opacity: 0.1,
              transform: "translate(-50%, -50%) ",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          />
        )}

        <div
          style={{
            paddingBottom: 10,

            marginBottom: 15,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedFirm.name === "Sharda Associates" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <img
                  src={shardaLogo}
                  alt="Sharda Associates Logo"
                  style={{ height: 92 }}
                />
                <img
                  src={shardaHeader}
                  alt="Sharda Header"
                  style={{ height: 75, marginBottom: 8 }}
                />
              </div>
            ) : selectedFirm.name === "Anunay Sharda & Associates" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <img
                  src={calogonew}
                  alt="Anunay Logo"
                  style={{ height: 100 }}
                />
              </div>
            ) : selectedFirm.name ===
              "Finaxis Business Consultancy Pvt. Ltd." ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <img
                  src={finaxisLogo}
                  alt="Finaxis Logo"
                  style={{ height: 80, marginBottom: 8 }}
                />
                <img
                  src={finaxisHeader}
                  alt="Finaxis Header"
                  style={{ height: 80, marginBottom: 8 }}
                />
              </div>
            ) : (
              <div
                style={{ fontSize: 24, color: "#1A2B59", fontWeight: "bold" }}
              >
                {selectedFirm.name}
              </div>
            )}
          </div>
        </div>
        {/* Item Table */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            // height: "800px",
            padding: "0 20px 0px 20px",
          }}
        >
          <table
            className="single-border-table"
            style={{ width: "100%", tableLayout: "fixed" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#eee" }}>
                {!isSharda ? (
                  <>
                    {!isSharda && showGSTIN && (
                      <th
                        colSpan={3}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          fontSize: 14,
                          textAlign: "center",
                          borderLeft: "none",
                          borderTop: "none",
                          borderBottom: "none",
                          borderRight: "none",
                        }}
                      >
                        GSTIN: {selectedFirm?.gstin}
                      </th>
                    )}
                    <th
                      colSpan={3}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        fontSize: 14,
                        textAlign: "center",
                        borderTop: "none",
                        borderBottom: "none",
                        borderRight: "none",
                      }}
                    >
                      {invoiceType}
                    </th>
                  </>
                ) : (
                  <th
                    colSpan={6}
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      fontWeight: "bold",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {invoiceType}
                  </th>
                )}
              </tr>
              <tr>
                <th
                  className="border-left-none"
                  colSpan={3}
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "bold",
                    fontSize: 12,
                    textAlign: "center",
                    width: "50%",

                    borderBottom: "none",
                    borderRight: "none",
                  }}
                >
                  CLIENT DETAILS
                </th>
                <th
                  colSpan={3}
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "bold",
                    fontSize: 12,
                    textAlign: "center",
                    width: "50%",

                    borderBottom: "none",
                    borderRight: "none",
                  }}
                >
                  COMPANY DETAILS
                </th>
              </tr>
              <tr>
                <td
                  className="text-align-center"
                  style={{
                    padding: 6,
                    fontWeight: "Bold",
                    width: "25%",
                    minWidth: "120px",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  Name
                </td>
                <td
                  colSpan={2}
                  style={{
                    padding: 6,
                    width: "35%",
                    fontWeight: "Bold",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  {customer.name}
                </td>
                <td
                  className="text-align-center"
                  style={{
                    padding: 6,
                    fontWeight: "bold",
                    width: "25%",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  Name
                </td>
                <td
                  colSpan={2}
                  style={{
                    padding: 6,
                    fontWeight: "Bold",
                    borderBottom: "none",
                  }}
                >
                  {selectedFirm.name}
                </td>
              </tr>

              {isSharda ? (
                <>
                  <tr>
                    <td
                      className="text-align-center"
                      rowSpan={3}
                      style={{
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      Address
                    </td>
                    <td
                      rowSpan={3}
                      colSpan={2}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      {customer.address}
                    </td>
                    <td
                      className="text-align-center"
                      style={{
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      Address
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      {selectedFirm.address}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-align-center"
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      Contact No.
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      {selectedFirm.phone}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      style={{ padding: 0, border: "1px solid black" }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              className="text-align-center"
                              style={{
                                padding: 6,
                                fontWeight: "bold",
                                borderTop: "none",
                                borderLeft: "none",
                              }}
                            >
                              Invoice No.
                            </td>
                            <td
                              style={{
                                fontWeight: "bold",
                                padding: 6,
                                border: "none",
                                borderBottom: "1px solid #000",
                              }}
                            >
                              {invoiceNumber}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="text-align-center"
                              style={{
                                padding: 6,
                                fontWeight: "bold",
                                ...(isSharda && { width: "50%" }),
                                borderRight: "1px solid black",
                                borderTop: "none",
                                borderBottom: "none",
                                borderLeft: "none",
                              }}
                            >
                              Invoice Date
                            </td>
                            <td
                              style={{
                                fontWeight: "bold",
                                padding: 6,
                                borderRight: "none",
                                borderBottom: "none",
                              }}
                            >
                              {invoiceDate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td
                      className="text-align-center"
                      style={{
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      Address
                    </td>

                    <td
                      colSpan={2}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "Bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      {customer.address}
                    </td>

                    <td
                      className="text-align-center"
                      style={{
                        padding: 6,
                        fontWeight: "bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      Address
                    </td>

                    <td
                      colSpan={2}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "Bold",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      {selectedFirm.address}
                    </td>
                  </tr>

                  {!isSharda && showGSTIN && (
                    <tr>
                      <td
                        className="text-align-center border-left-none"
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        GSTIN
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "Bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        {customer.GSTIN}
                      </td>

                      <td
                        className="text-align-center"
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        Contact No.
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "Bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        {selectedFirm.phone}
                      </td>
                    </tr>
                  )}

                  {isSharda && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                        }}
                      ></td>

                      <td
                        className="text-align-center"
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        Contact No.
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "Bold",
                          borderRight: "none",
                          borderBottom: "none",
                        }}
                      >
                        {selectedFirm.phone}
                      </td>
                    </tr>
                  )}

                  {!isSharda ? (
                    <tr>
                      <td
                        className="text-align-center"
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",

                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        Place of Supply
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          border: "none",
                          padding: 6,
                          fontWeight: "Bold",
                          borderTop: "",
                        }}
                      >
                        {placeOfSupply}
                      </td>

                      <td
                        colSpan={3}
                        style={{
                          border: "1px solid black",
                          padding: 0,
                          width: "50%", // Add this to ensure proper width
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                className="text-align-center"
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  border: "none",
                                  borderBottom: "1px solid #000",
                                  borderLeft: "none",
                                }}
                              >
                                Invoice No.
                              </td>
                              <td
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  border: "none",
                                  borderLeft: "1px solid #000",
                                  borderBottom: "1px solid #000",
                                }}
                              >
                                {invoiceNumber}
                              </td>
                            </tr>
                            <tr>
                              <td
                                className="text-align-center"
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  border: "none",
                                  borderBottom: "none",
                                  borderLeft: "none",
                                }}
                              >
                                Invoice Date
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
                                  borderRight: "none",
                                  borderBottom: "none",
                                  borderTop: "none",
                                }}
                              >
                                {invoiceDate}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          border: "1px solid black",
                          padding: 0,
                          width: "50%", // Add this to ensure proper width
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                className="text-align-center"
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  border: "none",
                                  borderBottom: "1px solid #000",
                                }}
                              >
                                Invoice No.
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
                                  width: "50%",
                                  borderLeft: "none",
                                  borderBottom: "none",
                                }}
                              >
                                {invoiceNumber}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  borderRight: "1px solid black",
                                  borderTop: "none",
                                  borderLeft: "none",
                                  borderBottom: "none",
                                }}
                              >
                                Invoice Date
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
                                  width: "50%",
                                  borderRight: "none",
                                  borderBottom: "none",
                                }}
                              >
                                {invoiceDate}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </thead>
          </table>
          <table className="w-[100%]">
            <tbody>
              <tr>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "11.8%",
                    fontWeight: "bold",
                    borderTop: "none",
                  }}
                >
                  Sr. No.
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "33.4%",
                    fontWeight: "bold",
                    textAlign: "left",
                    borderTop: "none",
                    borderLeft: "none",
                  }}
                >
                  Description of Services
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "15%",
                    fontWeight: "bold",
                    borderTop: "none",
                    borderLeft: "none",
                  }}
                >
                  SAC CODE
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "10%",
                    fontWeight: "bold",
                    borderTop: "none",
                    borderLeft: "none",
                  }}
                >
                  Unit(s)
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "10%",
                    fontWeight: "bold",
                    borderTop: "none",
                    borderLeft: "none",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "10%",
                    fontWeight: "bold",
                    borderTop: "none",
                    borderBottom: "1px solid black",
                    borderLeft: "none",
                  }}
                >
                  Amount
                </th>
              </tr>
              {itemsOnPage.map((item, idx) => {
                const amount = item.qty * item.rate;
                return (
                  <tr key={idx}>
                    <td
                      style={{
                        border: "1px solid black",
                        borderTop: "none",
                        borderBottom: "none",
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      {/* {idx + 1 + (isLastPage ? 0 : 0)} adjust if needed */}
                      {offset + idx + 1}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        borderTop: "none",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      {item.description}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                        borderTop: "none",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      9971
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                        borderTop: "none",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      {item.qty}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                        borderTop: "none",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      ₹{item.rate.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                        borderTop: "none",
                        borderBottom: "none",
                        borderLeft: "none",
                      }}
                    >
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              { ( notesToShow.length > 0) && (
                <tr>
                  {/* Sr. No. cell (empty to keep grid) */}
                  <td
                    style={{
                      border: "1px solid black",
                      borderTop: "none",
                      borderBottom: "none",
                      padding: 6,
                      textAlign: "center",
                    }}
                  >
                    &nbsp;
                  </td>

                  {/* Description cell with Times New Roman + italic notes */}
                  {pageNumber === 1 && notes.length > 0  && (
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      borderTop: "none",
                      borderBottom: "none",
                      borderLeft: "none",
                      fontFamily: "'Times New Roman', Times, serif",
                      fontStyle: "italic",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.35,
                    }}
                  >
                    <strong
                      style={{
                        fontFamily: "'Times New Roman', Times, serif",
                        fontStyle: "italic",
                      }}
                    >
                      Notes:
                    </strong>
                    {notesToShow.map((n, i) => (
                      <div key={n.id || i} style={{ marginTop: 4 }}>
                        • {n.text}
                      </div>
                    ))}
                  </td>
                  )}
                 

                  {/* Keep remaining columns blank but bordered to preserve the grid */}
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "center",
                      borderTop: "none",
                      borderBottom: "none",
                      borderLeft: "none",
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "center",
                      borderTop: "none",
                      borderBottom: "none",
                      borderLeft: "none",
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "right",
                      borderTop: "none",
                      borderBottom: "none",
                      borderLeft: "none",
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: 6,
                      textAlign: "right",
                      borderTop: "none",
                      borderBottom: "none",
                      borderLeft: "none",
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              )}
              {/* On first page, if more pages exist, add "To be continued..." */}
              {!isLastPage && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      padding: 10,
                    }}
                  >
                    Continue on next page...
                  </td>
                </tr>
              )}

              
              {isLastPage &&
                (() => {
                  const extraRows = notesToShow.length > 0 ? 1 : 0; // notes row occupies one
                  const fill = Math.max(
                    0,
                    ITEMS_PER_PAGE - itemsOnPage.length - extraRows
                  );
                  return Array.from({ length: fill }).map((_, idx) => (
                    <tr key={`empty-${idx}`} style={{ border: "none" }}>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          height: 30,
                          textAlign: "center",
                          borderTop: "none",
                          borderBottom: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          borderTop: "none",
                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          textAlign: "center",
                          borderTop: "none",
                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          textAlign: "center",
                          borderTop: "none",
                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          textAlign: "right",
                          borderTop: "none",
                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          textAlign: "right",
                          borderTop: "none",
                          borderBottom: "none",
                          borderLeft: "none",
                        }}
                      >
                        &nbsp;
                      </td>
                    </tr>
                  ));
                })()}

              {/* Totals and bank details only on last page */}
              {isLastPage && (
                <>
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
                        textAlign: "left",
                        paddingLeft: "60px",
                        borderBottom: "none",
                        borderRight: "none",
                      }}
                    >
                      Total in Rupees
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                        fontWeight: "bold",
                        borderBottom: "none",
                      }}
                    >
                      ₹{totalAmount.toFixed(2)}
                    </td>
                  </tr>

                  {/* Other totals and bank details */}
                  {/* Use your existing JSX for totals and bank details here */}

                  <tr>
                    <td
                      colSpan={isSharda ? 6 : 3}
                      style={{
                        border: "1px solid black",
                        borderRight: isSharda ? "1px solid black" : "none",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                borderBottom: "1px solid black",
                                padding: 6,
                                fontWeight: "light",
                                fontSize: 10,
                                textAlign: "center",
                                borderRight: "none",
                              }}
                            >
                              Total Amount in Words
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                borderBottom: "1px solid black",
                                padding: 6,
                                fontSize: 10,
                                fontWeight: "Bold",
                                textAlign: "center",
                              }}
                            >
                              {/* {numberToWordsIndian(totalAmountWithTax)} */}
                              {amountInWords}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                borderBottom: "1px solid black",
                                padding: 6,
                                fontSize: 10,
                                fontWeight: "Bold",
                                textAlign: "center",
                              }}
                            >
                              Bank Details
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="normal-text "
                              style={{
                                padding: "20px 6px 20px 6px",
                                fontSize: 10,
                                fontWeight: "normal",
                                fontStyle: "normal",
                              }}
                            >
                              Bank Name: {bankName} <br />
                              Account Name :{accountName} <br />
                              Account Number: {accountNumber} <br />
                              IFSC Code: {ifsc}
                            </td>
                          </tr>
                          {/* {isSharda && (
                            <tr>
                              <td
                                className="normal-text "
                                style={{
                                  padding: 6,
                                  fontSize: 10,
                                  fontWeight: "normal",
                                  fontStyle: "normal",
                                }}
                              >
                                <strong>
                                  Online Wallets - Paytm, Google Pay & Phone Pay
                                </strong>
                                <br />
                                Name : Anunay Sharda <br />
                                Mobile Number : 7869777747<br />
                                UPI ID - 7869777747@ybl
                              </td>
                            </tr>
                          )} */}
                          {getWalletInfo() && (
                            <tr>
                              <td
                                className="normal-text"
                                style={{ padding: 6, fontSize: 10 }}
                              >
                                {getWalletInfo()}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                    {isGSTFirm && (
                      <td
                        colSpan={3}
                        style={{ border: "1px solid black", padding: 0 }}
                      >
                        <table
                          style={{
                            width: "100%",

                            tableLayout: "fixed",
                            marginTop: "-37%",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  borderBottom: "1px solid black",
                                  padding: 6,
                                  fontSize: 10,
                                  textAlign: "right",
                                  borderLeft: "none",
                                }}
                              >
                                Taxable Value
                              </td>
                              <td
                                style={{
                                  borderBottom: "1px solid black",
                                  padding: 6,
                                  fontSize: 10,
                                  textAlign: "right",
                                }}
                              >
                                ₹{taxableValue.toFixed(2)}
                              </td>
                            </tr>

                            {isLocalSupply() ? (
                              <>
                                <tr>
                                  <td
                                    style={{
                                      borderBottom: "1px solid black",
                                      padding: 6,
                                      fontSize: 10,
                                      textAlign: "right",
                                    }}
                                  >
                                    Add: CGST (9%)
                                  </td>
                                  <td
                                    style={{
                                      borderBottom: "1px solid black",
                                      padding: 6,
                                      fontSize: 10,
                                      textAlign: "right",
                                    }}
                                  >
                                    ₹{cgstAmount.toFixed(2)}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      borderBottom: "1px solid black",
                                      padding: 6,
                                      fontSize: 10,
                                      textAlign: "right",
                                    }}
                                  >
                                    Add: SGST (9%)
                                  </td>
                                  <td
                                    style={{
                                      borderBottom: "1px solid black",
                                      padding: 6,
                                      fontSize: 10,
                                      textAlign: "right",
                                    }}
                                  >
                                    ₹{sgstAmount.toFixed(2)}
                                  </td>
                                </tr>
                              </>
                            ) : (
                              <tr>
                                <td
                                  style={{
                                    borderBottom: "1px solid black",
                                    padding: 6,
                                    fontSize: 10,
                                    textAlign: "right",
                                  }}
                                >
                                  Add: IGST (18%)
                                </td>
                                <td
                                  style={{
                                    borderBottom: "1px solid black",
                                    padding: 6,
                                    fontSize: 10,
                                    textAlign: "right",
                                  }}
                                >
                                  ₹{igstAmount.toFixed(2)}
                                </td>
                              </tr>
                            )}

                            <tr>
                              <td
                                style={{
                                  borderBottom: "1px solid black",
                                  padding: 6,
                                  fontSize: 10,
                                  textAlign: "right",
                                }}
                              >
                                Total Amount
                              </td>
                              <td
                                style={{
                                  borderBottom: "1px solid black",
                                  padding: 6,
                                  fontSize: 10,
                                  textAlign: "right",
                                }}
                              >
                                ₹{totalAmountWithTax.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    )}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        <p
          style={{
            fontSize: 10,
            marginTop: 10,
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          This is a system generated invoice and does not require any signature.
        </p>
      </div>
      {/* Footer */}
      <div style={{ marginLeft: "-20px", marginRight: "-20px" }}>
        {isSharda ? (
          <img
            className="footer-image"
            src={footerImageSharda}
            alt="Invoice Footer"
            style={footerStyle}
          />
        ) : (
          <img
            className="footer-image"
            src={footerImageFinaxis}
            alt="Invoice Footer"
            style={footerStyle}
          />
        )}
      </div>
    </div>
  );
}
