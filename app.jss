import {

  auth,
  db,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,

  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc

} from "./firebase.js";

async function login(){

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try{

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        document
            .getElementById("login")
            .classList.add("hidden");

        document
            .getElementById("app")
            .classList.remove("hidden");

        showTab("dashboard");

        loadDashboard();

        alert("Login Successful");

    }
    catch(error){

        alert(error.message);
    }
}

window.login = login;

async function createUser(){

    const email =
        document.getElementById(
            "newUserEmail"
        ).value;

    const password =
        document.getElementById(
            "newUserPassword"
        ).value;

    try{

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert(
            "User Created Successfully"
        );
    }
    catch(error){

        alert(error.message);
    }
}

window.createUser = createUser;

async function addVendor(){

    const vendor = {

        name:
        document.getElementById(
            "vendorName"
        ).value,

        country:
        document.getElementById(
            "vendorCountry"
        ).value,

        email:
        document.getElementById(
            "vendorEmail"
        ).value,

        createdAt:
        new Date()
            .toISOString()
    };

    await addDoc(

        collection(
            db,
            "vendors"
        ),

        vendor

    );

    loadVendors();

    loadDashboard();

    alert("Vendor Added");
}

window.addVendor = addVendor;

async function loadVendors(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "vendors"
            )
        );

    const vendorTable =
        document.getElementById(
            "vendorTable"
        );

    vendorTable.innerHTML = "";

    snapshot.forEach(docData=>{

        const vendor =
            docData.data();

        vendorTable.innerHTML += `
        <tr>

            <td>${vendor.name}</td>

            <td>${vendor.country}</td>

            <td>${vendor.email}</td>

        </tr>
        `;
    });
}

async function createInvoice(){

    const customer =
        document.getElementById(
            "customer"
        ).value;

    const country =
        document.getElementById(
            "country"
        ).value;

    const amount =
        Number(
            document.getElementById(
                "amount"
            ).value
        );

    const taxRate =
        taxes[country] || 0;

    const taxAmount =
        amount * taxRate / 100;

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

        status:
        "PENDING",

        createdBy:
        auth.currentUser.email,

        createdDate:
        new Date()
            .toISOString()
    };

    await addDoc(

        collection(
            db,
            "invoices"
        ),

        invoice

    );

    loadInvoices();

    loadDashboard();

    generatePDF(invoice);
}

window.createInvoice = createInvoice;

async function loadInvoices(){

    const snapshot =
        await getDocs(
            collection(
                db,
                "invoices"
            )
        );

    const invoiceTable =
        document.getElementById(
            "invoiceTable"
        );

    invoiceTable.innerHTML = "";

    snapshot.forEach(docData=>{

        const invoice =
            docData.data();

        invoiceTable.innerHTML += `
        <tr>

            <td>${invoice.invoiceNo}</td>

            <td>${invoice.customer}</td>

            <td>${invoice.country}</td>

            <td>${invoice.total}</td>

            <td>${invoice.status}</td>

        </tr>
        `;
    });
}

async function loadDashboard(){

    const vendorSnapshot =
        await getDocs(
            collection(
                db,
                "vendors"
            )
        );

    const invoiceSnapshot =
        await getDocs(
            collection(
                db,
                "invoices"
            )
        );

    let revenue = 0;

    invoiceSnapshot.forEach(docData=>{

        revenue +=
            docData.data().total;
    });

    document.getElementById(
        "vendorCount"
    ).innerText =
        vendorSnapshot.size;

    document.getElementById(
        "invoiceCount"
    ).innerText =
        invoiceSnapshot.size;

    document.getElementById(
        "revenue"
    ).innerText =
        revenue.toFixed(2);
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXjnoLyw93isnQZk1C5BZvT2o_kz6tLqg",
  authDomain: "invoicing-app-7b347.firebaseapp.com",
  projectId: "invoicing-app-7b347",
  storageBucket: "invoicing-app-7b347.firebasestorage.app",
  messagingSenderId: "52010588221",
  appId: "1:52010588221:web:2d70b34e48ce8e45d53254",
  measurementId: "G-8DP3RJVK54"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
  auth,
  db,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,

  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
};
