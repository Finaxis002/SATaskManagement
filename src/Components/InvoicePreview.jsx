import React from "react";
import finaxisLogo from "../assets/Finaxis_logo.png";
import shardaLogo from "../assets/ShardaLogo.png";
import footerImageFinaxis from "../assets/LetterheadBottomFinaxis.jpg";
import headerImageFinaxis from "../assets/LetterheadTopFinaxis.png";
import finaxisHeader from "../assets/finaxis_header.png";
import shardaHeader from "../assets/ShardaHeader.png";
import headerImageSharda from "../assets/ShardaTop.png";
import footerImageSharda from "../assets/ShardaBottom.png";

export default function InvoicePreview({
  selectedFirm,
  invoiceType,
  invoiceNumber,
  invoiceDate,
  placeOfSupply,
  customer,
  items,
}) {
  if (!selectedFirm || !customer || !items) return null;

  const isSharda = selectedFirm.name === "Sharda Associates";
  const showGSTIN = !!selectedFirm.gstin;

  // Calculate totals & taxes
  const isLocalSupply = () => {
    const place = (placeOfSupply || "").toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.qty) * Number(item.rate),
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

  return (
    <div
      style={{
        flex: "1 1 800px",
        maxWidth: 800,
        backgroundColor: "#fff",
        border: "1px solid #000",
        padding: "0 20px 0px 20px",
        fontFamily: "'Glacial Indifference', sans-serif",
        fontSize: 12,
        color: "#000",
        position: "relative",
      }}
    >
      {/* Watermark */}
      {isSharda ? (
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
            transform: "translate(-50%, -50%)",
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
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Header Image */}
      <div
        style={{
          marginTop: "-20px",
          marginLeft: -20,
          marginRight: -20,
          marginBottom: 5,
        }}
      >
        {isSharda ? (
          <img
            src={headerImageSharda}
            alt="Invoice header"
            style={{ width: "100%", display: "block", height: "auto" }}
          />
        ) : (
          <img
            src={headerImageFinaxis}
            alt="Invoice header"
            style={{ width: "100%", display: "block", height: "auto" }}
          />
        )}
      </div>

      {/* Company Header */}
      <div
        style={{
          paddingBottom: 10,
          marginBottom: 15,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 24,
              color: "#1A2B59",
              lineHeight: 1.1,
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            {selectedFirm.name === "Sharda Associates" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={shardaLogo}
                  alt="Sharda Associates Logo"
                  style={{ height: 80, marginBottom: 8 }}
                />
                <img
                  src={shardaHeader}
                  alt="finaxis business consultancy header"
                  style={{ height: 75, marginBottom: 8 }}
                />
              </div>
            ) : selectedFirm.name === "Finaxis Business Consultancy" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={finaxisLogo}
                  alt="Finaxis Logo"
                  style={{ height: 80, marginBottom: 8 }}
                />
                <img
                  src={finaxisHeader}
                  alt="finaxis business consultancy header"
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
      </div>
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          // height: "800px",
          padding: "0 20px 0px 20px",
        }}
      >
        {/* Invoice Main Table */}
        <table
          className="single-border-table"
          style={{ width: "100%", tableLayout: "fixed" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              {!isSharda ? (
                <>
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
                    GSTIN: {selectedFirm.gstin}
                  </th>
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
                                borderRight: "none",
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
                                borderLeft: "none",
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
                                borderLeft: "none",
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

            {items.map((item, idx) => {
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
                    {idx + 1}
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
                    ₹{Number(item.rate).toFixed(2)}
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

            {/* Fill empty rows if less than 6 items */}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map(
              (_, idx) => (
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
              )
            )}
            {/* Empty rows to fix minimum height */}
            {items.length < 3 && (
              <tr>
                <td
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    height: 25,
                  }}
                  colSpan={6}
                />
              </tr>
            )}

            {/* Footer Section */}
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
                        {numberToWordsIndian(totalAmountWithTax)}
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
                        Bank Name: {selectedFirm?.bank?.name} <br />
                        Account Name :{selectedFirm?.bank?.accountName} <br />
                        Account Number: {selectedFirm?.bank?.account} <br />
                        IFSC Code: {selectedFirm?.bank?.ifsc}
                      </td>
                    </tr>
                    {isSharda && (
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
                          Mobile Number : 7869777747
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
              {!isSharda && (
                <td
                  colSpan={3}
                  style={{ border: "1px solid black", padding: 0 }}
                >
                  <table
                    style={{
                      width: "100%",

                      tableLayout: "fixed",
                      marginTop: "-39%",
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

      {/* Footer Image */}
      <div
        style={{ marginLeft: "-20px", marginRight: "-20px", marginTop: 180 }}
      >
        {isSharda ? (
          <img
            src={footerImageSharda}
            alt="Invoice Footer"
            style={{ width: "100%", display: "block", height: "auto" }}
          />
        ) : (
          <img
            src={footerImageFinaxis}
            alt="Invoice Footer"
            style={{ width: "100%", display: "block", height: "auto" }}
          />
        )}
      </div>
    </div>
  );
}
