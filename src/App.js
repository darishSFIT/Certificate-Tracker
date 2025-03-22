import React, { useState } from 'react';
import { ethers } from 'ethers'; // Correct import for ethers v6+
import contractABI from './contractABI.json';
import axios from 'axios';

var cont_addr = "0x45578e09e368a95eb3ca396da7a12a86fe0fe8e5";
console.log("Contract Address:", cont_addr);
const contractAddress = '0x45578e09e368a95eb3ca396da7a12a86fe0fe8e5'; // Replace with your contract's address

function App() {
    const [CertificateId, setCertificateId] = useState('');
    const [CertificateInfo, setCertificateInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to verify Certificate authenticity
    async function verifyCertificate() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        // const provider = new ethers.BrowserProvider(window.ethereum, { ensAddress: null });
        // const provider = new ethers.BrowserProvider(window.ethereum, null);

        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        setLoading(true);
        try {
            // First check if the certificate exists
            const result = await contract.verifyCertificate(CertificateId);
            console.log("Verification Result:", result); // Debug log

            if (!result) {
                throw new Error("Certificate not found");
            }

            // Parse the result properly
            setCertificateInfo({
                id: result[0],
                name: result[1],
                owner: result[2],
                certification: result[3],
                isAuthentic: result[4]
            });
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("Certificate verification failed: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    // Function to add Certificate
    async function addCertificate() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        // const provider = new ethers.BrowserProvider(window.ethereum, { chainId: 1337, name: 'ganache' });
        // const provider = new ethers.BrowserProvider(window.ethereum, null);
        // const provider = new ethers.BrowserProvider(window.ethereum);
        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Test data
        const CertificateData = {
            id: CertificateId || "C001", // Use input ID if available
            name: "John Doe",
            owner: "University XYZ",
            certification: "Bachelor of Science",
            cid: "QmYourActualCIDHere" // Replace with actual IPFS CID
        };

        try {
            console.log("Adding certificate with data:", CertificateData); // Debug log
            const tx = await contract.addCertificate(
                CertificateData.id,
                CertificateData.name,
                CertificateData.owner,
                CertificateData.certification,
                CertificateData.cid
            );
            console.log("Transaction:", tx); // Debug log
            const receipt = await tx.wait();
            console.log("Receipt:", receipt); // Debug log
            alert("✅ Certificate added successfully!");
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("❌ Failed to add Certificate: " + (error.message || "Unknown error"));
        }
    }

    // Function to fetch Certificate details
    async function fetchCertificateDetails() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        // const provider = new ethers.BrowserProvider(window.ethereum, { chainId: 1337, name: 'ganache' });
        // const provider = new ethers.BrowserProvider(window.ethereum, null);

        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        try {
            console.log("Fetching CID for certificate:", CertificateId); // Debug log
            const cid = await contract.getCertificateCID(CertificateId);
            console.log("Received CID:", cid); // Debug log

            if (!cid || cid === "") {
                throw new Error("Invalid CID received");
            }

            const ipfsURL = `https://ipfs.io/ipfs/${cid}`;
            const response = await axios.get(ipfsURL);
            console.log("IPFS Response:", response.data); // Debug log

            setCertificateInfo(response.data);
            alert("✅ Certificate found!");
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("❌ Error fetching Certificate: " + (error.message || "Unknown error"));
        }
    }

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Certificate Verification System</h1>

            <div>
                <input
                    type="text"
                    placeholder="Enter Certificate ID"
                    value={CertificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    style={{
                        padding: '10px',
                        width: '300px',
                        marginBottom: '10px',
                    }}
                />
                <button
                    onClick={verifyCertificate}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
                <button
                    onClick={addCertificate}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '10px'
                    }}
                >
                    Add Certificate
                </button>
                <button
                    onClick={fetchCertificateDetails}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#FFC107',
                        color: 'black',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '10px'
                    }}
                >
                    Fetch Certificate Details
                </button>
            </div>

            {CertificateInfo && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <h2>Certificate Information</h2>
                    <p><strong>ID:</strong> {CertificateInfo.id || "N/A"}</p>
                    <p><strong>Name:</strong> {CertificateInfo.name || "N/A"}</p>
                    <p><strong>Owner:</strong> {CertificateInfo.owner || "N/A"}</p>
                    <p><strong>Certification:</strong> {CertificateInfo.certification || "N/A"}</p>
                    <p><strong>Status:</strong> {CertificateInfo.isAuthentic ? "Authentic" : "Tampered"}</p>
                </div>
            )}
        </div>
    );
}

export default App;
