import React, { useEffect, useState } from "react";
import finaxisLogo from "../../assets/Finaxis_logo.png";
import shardaLogo from "../../assets/ShardaLogo.png";
import footerImageFinaxis from "../../assets/LetterheadBottomFinaxis.jpg";
import headerImageFinaxis from "../../assets/headerImgFinaxis1.png";
import finaxisHeader from "../../assets/finaxis_header.png";
import shardaHeader from "../../assets/ShardaHeader.png";
import headerImageSharda from "../../assets/headerImgSharda.png";
import footerImageSharda from "../../assets/ShardaBottom.png";

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
}) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
useEffect(() => {
  let loaded = 0;
  const totalImages = 2;

  const handleImageLoad = () => {
    loaded++;
    if (loaded === totalImages) {
      setImagesLoaded(true);
    }
  };

  const headerImg = new Image();
  const footerImg = new Image();

  headerImg.src = isSharda ? headerImageSharda : headerImageFinaxis;
  footerImg.src = isSharda ? footerImageSharda : footerImageFinaxis;

  headerImg.onload = handleImageLoad;
  footerImg.onload = handleImageLoad;
}, [isSharda]);

  const isLocalSupply = () => {
    const place = placeOfSupply.toLowerCase().replace(/\s+/g, "");
    return place === "mp" || place === "madhyapradesh";
  };

  
  const headerStyle = pageNumber === 1
  ? { width: "100%", display: "block", height: "auto", marginBottom: 20 }
  : { width: "100%", display: "block", height: 'auto', marginTop:-30 }

  const footerStyle = pageNumber === 1
  ? { width: "100%", display: "block", height: "auto" , marginTop: 35  }
  : { width: "100%", display: "block", height: 'auto', marginTop: 18 }

  const ITEMS_PER_PAGE = 8;
  
  return (
    <div className="pdf-wrapper">
      {/* Header */}
      <div
        style={{
          margin: 0,
          padding: 0,
        }}
      >
        {isSharda ? (
          <img
          id="header-img"
            className="header-image"
            src={headerImageSharda}
            alt="Invoice header"
            // style={{ width: "100%", display: "block", height: "auto" }}
            style={headerStyle}
          />
        ) : (
          <img
          id="header-img"
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

        {/* Insert your existing client/company details table header here */}
        {/* For brevity, reuse your existing header code block here */}
        {/* You can move your existing header JSX here as well */}
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
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  color: "#1A2B59",
                  lineHeight: 1.1,
                  textAlign: "center",
                  fontWeight: "",
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                {/* {selectedFirm.name.split(" ").join("\n")} */}
                {/* {selectedFirm.name} */}
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: 15,
                  }}
                >
                  {selectedFirm.name === "Sharda Associates" ? (
                    // Sharda Associates Header
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <img
                          src={shardaLogo}
                          alt="Sharda Associates Logo"
                          style={{ height: 92 }}
                        />

                        <img
                          src={shardaHeader}
                          alt="finaxis business consultancy header"
                          style={{ height: 75, marginBottom: 8 }}
                        />
                      </div>
                    </>
                  ) : selectedFirm.name === "Finaxis Business Consultancy" ? (
                    // Finaxis Header
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
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
                    </>
                  ) : (
                    // Default Header (simple)
                    <div
                      style={{
                        fontSize: 24,
                        color: "#1A2B59",
                        fontWeight: "bold",
                      }}
                    >
                      {selectedFirm.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Item Table */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            height: "800px",
            padding: "0 20px 0px 20px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid black",
              tableLayout: "fixed",
              height: "100%",
            }}
          >
            <colgroup>
              <col style={{ width: "10%" }} />
              <col />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col />
              <col style={{ width: "15%" }} />
            </colgroup>
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
                  colSpan={3}
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "bold",
                    fontSize: 12,
                    textAlign: "center",
                    width: "50%",
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
                  }}
                >
                  COMPANY DETAILS
                </th>
              </tr>
              <tr>
                <td
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "Bold",
                    width: "15%",
                    minWidth: "120px",
                  }}
                >
                  Name
                </td>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "35%",
                    fontWeight: "Bold",
                  }}
                >
                  {customer.name}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "bold",
                    width: "15%",
                  }}
                >
                  Name
                </td>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    fontWeight: "Bold",
                  }}
                >
                  {selectedFirm.name}
                </td>
              </tr>

              {isSharda ? (
                <>
                  <tr>
                    <td
                      rowSpan={3}
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
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
                      }}
                    >
                      {customer.address}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
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
                      }}
                    >
                      {selectedFirm.address}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
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
                              style={{
                                padding: 6,
                                fontWeight: "bold",
                                width: "50%",
                                borderRight: "1px solid black",
                                borderBottom: "1px solid black",
                              }}
                            >
                              Invoice No.
                            </td>
                            <td
                              style={{
                                fontWeight: "bold",
                                padding: 6,
                                width: "50%",
                                borderBottom: "1px solid black",
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
                              }}
                            >
                              Invoice Date
                            </td>
                            <td
                              style={{
                                fontWeight: "bold",
                                padding: 6,
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
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
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
                      }}
                    >
                      {customer.address}
                    </td>

                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        fontWeight: "bold",
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
                      }}
                    >
                      {selectedFirm.address}
                    </td>
                  </tr>

                  {!isSharda && (
                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
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
                        }}
                      >
                        {customer.GSTIN}
                      </td>

                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
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
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
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
                        }}
                      >
                        {selectedFirm.phone}
                      </td>
                    </tr>
                  )}

                  {!isSharda ? (
                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "bold",
                        }}
                      >
                        Place of Supply
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid black",
                          padding: 6,
                          fontWeight: "Bold",
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
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  width: "50%",
                                  borderRight: " 1px solid black",
                                  borderBottom: "1px solid black",
                                }}
                              >
                                Invoice No.
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
                                  width: "50%",
                                  borderBottom: "1px solid black",
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
                                }}
                              >
                                Invoice Date
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
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
                                style={{
                                  padding: 6,
                                  fontWeight: "bold",
                                  width: "50%",
                                  borderRight: " 1px solid black",
                                  borderBottom: "1px solid black",
                                }}
                              >
                                Invoice No.
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
                                  width: "50%",
                                  borderBottom: "1px solid black",
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
                                }}
                              >
                                Invoice Date
                              </td>
                              <td
                                style={{
                                  fontWeight: "Bold",
                                  padding: 6,
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

            <tbody>
              <tr>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "6%",
                    fontWeight: "bold",
                  }}
                >
                  Sr. No.
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: 6,
                    width: "50%",
                    fontWeight: "bold",
                    textAlign: "left",
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
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      {/* {idx + 1 + (isLastPage ? 0 : 0)} adjust if needed */}
                      {offset + idx + 1}
                    </td>
                    <td style={{ border: "1px solid black", padding: 6 }}>
                      {item.description}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      9971
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      {item.qty}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                      }}
                    >
                      ₹{item.rate.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                      }}
                    >
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

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

              {/* On last page, fill empty rows to make 8 rows */}
              {isLastPage &&
                Array.from({
                  length: Math.max(0, ITEMS_PER_PAGE - itemsOnPage.length),
                }).map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ border: "none" }}>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        height: 30,
                        textAlign: "center",
                      }}
                    >
                      &nbsp;
                    </td>
                    <td style={{ border: "1px solid black", padding: 6 }}>
                      &nbsp;
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      &nbsp;
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "center",
                      }}
                    >
                      &nbsp;
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                      }}
                    >
                      &nbsp;
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: 6,
                        textAlign: "right",
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>
                ))}

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
                        textAlign: "right",
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
                      style={{ border: "1px solid black", padding: 0 }}
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
                              Bank Name: {selectedFirm.bank.name} <br />
                              Account Name :{selectedFirm.bank.accountName}{" "}
                              <br />
                              Account Number: {selectedFirm.bank.account} <br />
                              IFSC Code: {selectedFirm.bank.ifsc}
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
                                  fontSize: 10,
                                  textAlign: "right",
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
            This is a system generated invoice and does not require any
            signature.
          </p>
      </div>
      {/* Footer */}
      <div style={{ marginLeft: "-20px", marginRight: "-20px"}}>
        {isSharda ? (
          <img
          id="footer-img"
            className="footer-image"
            src={footerImageSharda}
            alt="Invoice Footer"
            style={footerStyle}
          />
        ) : (
          <img
          id="footer-img"
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