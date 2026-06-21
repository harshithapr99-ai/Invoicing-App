const users = [
  {
    email: "admin@invoicepro.com",
    password: "admin123",
    role: "SUPER_ADMIN"
  }
];

function login() {

    const email =
        document.getElementById("email")
        .value
        .trim();

    const password =
        document.getElementById("password")
        .value
        .trim();

    if (
        email === "admin@invoicepro.com" &&
        password === "admin123"
    ) {

        document.getElementById("login")
            .classList.add("hidden");

        document.getElementById("app")
            .classList.remove("hidden");

        loadData();

    } else {

        alert(
            "Invalid Login\n\nUse:\nadmin@invoicepro.com\nadmin123"
        );

        console.log("Entered Email:", email);
        console.log("Entered Password:", password);
    }
}

function showTab(tabId) {

    const tabs =
        document.querySelectorAll(".tab");

    tabs.forEach(tab => {
        tab.classList.add("hidden");
    });

    const selectedTab =
        document.getElementById(tabId);

    if (selectedTab) {
        selectedTab.classList.remove("hidden");
    }
}

const TAX_RULES = {
  India: {
    taxType: "GST",
    rate: 18
  },
  Germany: {
    taxType: "VAT",
    rate: 19
  },
  UK: {
    taxType: "VAT",
    rate: 20
  },
  UAE: {
    taxType: "VAT",
    rate: 5
  },
  Canada: {
    taxType: "GST/HST",
    rate: 13
  }
};

function getTax(country, amount) {
  const rule = TAX_RULES[country];

  if (!rule) {
    return {
      taxType: "N/A",
      taxAmount: 0,
      rate: 0
    };
  }

  return {
    taxType: rule.taxType,
    rate: rule.rate,
    taxAmount: amount * rule.rate / 100
  };
}

let vendors =
  JSON.parse(localStorage.getItem("vendors")) || [];

function addVendor() {

  const vendor = {
    id: Date.now(),
    name: vendorName.value,
    country: vendorCountry.value,
    email: vendorEmail.value
  };

  vendors.push(vendor);

  localStorage.setItem(
    "vendors",
    JSON.stringify(vendors)
  );

  renderVendors();
  
  loadDashboard();
}

function renderVendors() {

  vendorTable.innerHTML = "";

  vendors.forEach(vendor => {

    vendorTable.innerHTML += `
      <tr>
        <td>${vendor.name}</td>
        <td>${vendor.country}</td>
        <td>${vendor.email}</td>
      </tr>
    `;
  });
}

let invoices =
  JSON.parse(localStorage.getItem("invoices")) || [];

function createInvoice() {

    const customer =
        document.getElementById("customer").value.trim();

    const country =
        document.getElementById("country").value;

    const amount =
        parseFloat(
            document.getElementById("amount").value
        ) || 0;

    if (!customer) {
        alert("Enter customer name");
        return;
    }

    if (amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    const rate =
    TAX_RULES[country]
        ? TAX_RULES[country].rate
        : 0;

    const taxAmount =
        amount * rate / 100;

    const total =
        amount + taxAmount;

    const invoice = {
        invoiceNo:
            "INV-" + Date.now(),

        customer,
        country,
        amount,
        taxAmount,
        total,
        status: "PENDING"
    };

    invoices.push(invoice);

    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );

    generatePDF(invoice);

    logActivity("Invoice Generated");

    loadData();

    alert(
        "Invoice Created: " +
        invoice.invoiceNo
    );
}

function calculateTax() {

    const amount =
        parseFloat(
            document.getElementById("amount").value
        ) || 0;

    const country =
        document.getElementById("country").value;

    const rate =
        TAX_RULES[country]
            ? TAX_RULES[country].rate
            : 0;

    const taxAmount =
        amount * rate / 100;

    const total =
        amount + taxAmount;

    document.getElementById(
        "taxInfo"
    ).innerText =
        rate + "% (" +
        taxAmount.toFixed(2) +
        ")";

    document.getElementById(
        "totalInfo"
    ).innerText =
        total.toFixed(2);
}

function loadData(){

    renderVendors();

    loadDashboard();

    renderActivities();

    loadPieChart();
}

function loadDashboard() {

  const totalInvoices =
    invoices.length;

  const revenue =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.total,
      0
    );

document.getElementById("vendorCount").innerText =
    vendors.length;
document.getElementById("invoiceTable").innerHTML =
    invoices.map(i => `
        <tr>
            <td>${i.invoiceNo}</td>
            <td>${i.customer}</td>
            <td>${i.country}</td>
            <td>${i.total.toFixed(2)}</td>
        </tr>
    `).join("");

  const totalTax =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.taxAmount,
      0
    );

  document.getElementById(
    "invoiceCount"
  ).innerText = totalInvoices;

  document.getElementById(
    "revenue"
  ).innerText =
    revenue.toFixed(2);

  document.getElementById(
    "taxTotal"
  ).innerText =
    totalTax.toFixed(2);
}

let activities =
  JSON.parse(
    localStorage.getItem("activities")
  ) || [];

function logActivity(message) {

  activities.push({
    timestamp: new Date().toLocaleString(),
    message
  });

  localStorage.setItem(
    "activities",
    JSON.stringify(activities)
  );
}

function renderActivities(){

    const activityLog =
        document.getElementById(
            "activityLog"
        );

    if(!activityLog) return;

    activityLog.innerHTML = "";

    activities.forEach(a=>{

        activityLog.innerHTML +=
        `<li>
            ${a.timestamp} - ${a.message}
        </li>`;
    });
}

function markPaid(invoiceNo) {

  const invoice =
    invoices.find(
      i => i.invoiceNo === invoiceNo
    );

  if (invoice) {

    invoice.status = "Paid";

    localStorage.setItem(
      "invoices",
      JSON.stringify(invoices)
    );

    renderInvoices();
  }
}

function loadPieChart() {

  const paid =
    invoices.filter(
      i => i.status === "Paid"
    ).length;

  const pending =
    invoices.filter(
      i => i.status === "Pending"
    ).length;

  const overdue =
    invoices.filter(
      i => i.status === "Overdue"
    ).length;

  new Chart(
    document.getElementById("pieChart"),
    {
      type: "pie",
      data: {
        labels: [
          "Paid",
          "Pending",
          "Overdue"
        ],
        datasets: [{
          data: [
            paid,
            pending,
            overdue
          ]
        }]
      }
    }
  );
}

function renderVendors(){

    vendorTable.innerHTML = "";

    vendors.forEach(vendor => {

        vendorTable.innerHTML += `
        <tr>
            <td>${vendor.name}</td>
            <td>${vendor.country}</td>
            <td>${vendor.email}</td>
            <td>${vendor.dueAmount}</td>

            <td>
                <button onclick="editVendor(${vendor.id})">
                    Edit
                </button>

                <button onclick="deleteVendor(${vendor.id})">
                    Delete
                </button>
            </td>
        </tr>`;
    });
}

function recordPayment(
    invoiceNo,
    amountPaid
){

    const invoice =
        invoices.find(
            i => i.invoiceNo === invoiceNo
        );

    if(!invoice) return;

    invoice.paidAmount += amountPaid;

    invoice.dueAmount =
        invoice.amount -
        invoice.paidAmount;

    if(invoice.dueAmount <= 0){

        invoice.status = "PAID";

        generatePaymentReceipt(
            invoice
        );

    }else{

        invoice.status =
            "PARTIAL";
    }

    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );
}

function generatePaymentReceipt(
    invoice
){

    const receipt = {

        receiptNo:
            "REC-" + Date.now(),

        invoiceNo:
            invoice.invoiceNo,

        customer:
            invoice.customer,

        amountPaid:
            invoice.paidAmount,

        paymentDate:
            new Date()
                .toLocaleDateString()
    };

    console.log(
        "Receipt Generated",
        receipt
    );
}

function generatePDF(invoice) {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 20, 20);

    doc.setFontSize(12);

    doc.text(
        "Invoice No: " +
        invoice.invoiceNo,
        20,
        40
    );

    doc.text(
        "Customer: " +
        invoice.customer,
        20,
        50
    );

    doc.text(
        "Country: " +
        invoice.country,
        20,
        60
    );

    doc.text(
        "Amount: " +
        invoice.amount,
        20,
        70
    );

    doc.text(
        "Tax: " +
        invoice.taxAmount,
        20,
        80
    );

    doc.text(
        "Total: " +
        invoice.total,
        20,
        90
    );

    doc.save(
        invoice.invoiceNo + ".pdf"
    );
}

console.log(typeof login);

console.log("APP JS LOADED SUCCESSFULLY");
