# **[Secure Certificate Storage](https://docs.google.com/presentation/d/1uJ8Jf2m942uzLYJcpbtVhoVfmlEGJeluoRO8wgf4QVM/edit?usp=sharing) - Setup Guide**  

This guide provides step-by-step instructions to set up and run the **Secure Certificate Storage** application using **Ganache, MetaMask, Remix IDE, and React**.

---

## **1️⃣ Setup Ganache**  
1. Open **Ganache** and click on **Quickstart**.  
2. Select the **1st Ethereum account**.  
3. Click on the **key symbol** and **copy the private key**.  

---

## **2️⃣ Setup MetaMask**  
### **Enable Test Networks & Import Ganache Account**  
1. Open **MetaMask** and go to **Networks (top left corner)**.  
2. Enable **Show test networks**.  
3. Click on **Add Custom Network**.  

   ![MetaMask Network Setup](https://i.imgur.com/NfIK0ia.png)  

4. Click on your **MetaMask Account (top center)**.  
5. Click **Add account or hardware wallet → Import account**.  
6. Paste the **private key** copied from **Ganache** and click **Import**.  

---

## **3️⃣ Deploy Smart Contract on Remix IDE**  
1. Open **Remix IDE**.  
2. In the **contracts folder**, paste your **`CertificateTracker.sol`** code.  
3. Compile it using **Solidity Compiler v0.8.0**.  

### **Deploy the Smart Contract**  
1. Go to the **Deploy & Run Transactions** tab.  
2. In **Environment**, select:  
   - **Custom - External HTTP Provider**.  
   - Change **`http://127.0.0.1:8545`** → **`http://127.0.0.1:7545`** (or the port in Ganache).  
3. Select the **1st account** and click **Deploy**.  
4. In the **Terminal**, expand your **deployed contract**.  
5. Copy the **contract address** (you'll need it for the next steps).  

### **Add Certificate Data**  
- Under **Deployed Contracts**, enter sample certificate details for later verification.  

---

## **4️⃣ Clone & Setup Project Locally**  
### **Clone Repository**  
Open **your local IDE (VS Code, etc.)** and run:  
```sh
git clone https://github.com/darishSFIT/Certificate-Tracker
```
or download & extract [this ZIP](https://github.com/darishSFIT/Certificate-Tracker/archive/refs/heads/main.zip) in your project folder.  

---

## **5️⃣ Update Configuration Files**  
### **Update `.env` File**  
1. Open `.env` file in your project.  
2. Paste the **contract address** you copied from Remix IDE.  

### **Update `src/App.js`**  
1. Open **`src/App.js`**.  
2. On **line 8**, update the `contractAddress` with the **same copied contract address**.  

---

## **6️⃣ Install Dependencies & Run the UI**  
Run the following commands in the terminal:  

```sh
npm install
npm start
```

🚀 Your **Secure Certificate Storage** application should now be running! 🎉  

---

## **📌 Summary of Steps**  
✔ **Ganache:** Copy **private key**.  
✔ **MetaMask:** Import account using **private key**.  
✔ **Remix IDE:** Deploy **`CertificateTracker.sol`** and copy **contract address**.  
✔ **Clone Project:** Set up repo & update **contract address**.  
✔ **Run UI:** Install dependencies & start the **React app**.  

💡 **Now you can verify, add, and fetch certificates using the decentralized system!**  

---

Let me know if you need further improvements! 🚀🔥
