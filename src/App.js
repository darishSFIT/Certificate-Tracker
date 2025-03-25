import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractABI from './contractABI.json';
import axios from 'axios';

//var cont_addr = "0x45578e09e368a95eb3ca396da7a12a86fe0fe8e5";
//console.log("Contract Address:", cont_addr);
const contractAddress = '0xae692a1ad75de88ce8d58a4b7c7a837c5d8b1430'; // Replace with your contract's address

// Pinata configuration
const PINATA_API_KEY = 'e648d34f4dbbe45a91c7';
const PINATA_SECRET_KEY = 'd8e0207ff09c80bc22cc52df62be1b8d7027a2f077972d668df043843fbbd80b';

function App() {
    const [certificateData, setCertificateData] = useState({
        id: '',
        name: '',
        owner: '',
        certification: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [CertificateInfo, setCertificateInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCertificateData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Function to verify Certificate authenticity
    async function verifyCertificate() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        setLoading(true);
        try {
            // Get all certificate info including CID
            const result = await contract.verifyCertificate(certificateData.id);
            console.log("Verification Result:", result); // Debug log

            if (!result) {
                throw new Error("Certificate not found");
            }

            // Parse the result properly with CID
            setCertificateInfo({
                id: result[0],
                name: result[1],
                owner: result[2],
                certification: result[3],
                isAuthentic: result[4],
                cid: result[5],
                pdfUrl: `https://gateway.pinata.cloud/ipfs/${result[5]}`
            });
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("Certificate verification failed: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    // Function to upload file to Pinata
    async function uploadToIPFS(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Optional: Add metadata
            const metadata = JSON.stringify({
                name: file.name,
                keyvalues: {
                    certificateId: certificateData.id,
                    owner: certificateData.owner
                }
            });
            formData.append('pinataMetadata', metadata);

            // Optional: Add pinata options
            const options = JSON.stringify({
                cidVersion: 0
            });
            formData.append('pinataOptions', options);

            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'pinata_api_key': PINATA_API_KEY,
                        'pinata_secret_api_key': PINATA_SECRET_KEY
                    }
                }
            );

            return response.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading to Pinata:', error);
            throw error;
        }
    }

    // Function to add Certificate
    async function addCertificate() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        if (!selectedFile) {
            alert("Please select a file to upload");
            return;
        }

        setLoading(true);
        try {
            // Upload file to Pinata first
            const ipfsCid = await uploadToIPFS(selectedFile);
            
            const provider = new ethers.BrowserProvider(window.ethereum); 
            await provider.ready; 
            provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });
            
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.addCertificate(
                certificateData.id,
                certificateData.name,
                certificateData.owner,
                certificateData.certification,
                ipfsCid
            );

            await tx.wait();
            alert("✅ Certificate added successfully!");
            
            // Reset form
            setCertificateData({
                id: '',
                name: '',
                owner: '',
                certification: ''
            });
            setSelectedFile(null);
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("❌ Failed to add Certificate: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    // Function to fetch Certificate details
    async function fetchCertificateDetails() {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        try {
            // First get the basic certificate info
            const result = await contract.verifyCertificate(certificateData.id);
            
            // Then get the IPFS CID
            const cid = await contract.getCertificateCID(certificateData.id);

            setCertificateInfo({
                id: result[0],
                name: result[1],
                owner: result[2],
                certification: result[3],
                isAuthentic: result[4],
                pdfUrl: `https://gateway.pinata.cloud/ipfs/${cid}`
            });
            
            alert("✅ Certificate found!");
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("❌ Error fetching Certificate: " + (error.message || "Unknown error"));
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Certificate Tracker
                    </h1>
                    <p className="text-lg text-gray-600">
                        Securely store and verify certificates using blockchain technology
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Add New Certificate
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="id"
                                placeholder="Certificate ID"
                                value={certificateData.id}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                            />
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={certificateData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                            />
                            <input
                                type="text"
                                name="owner"
                                placeholder="Owner"
                                value={certificateData.owner}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                            />
                            <input
                                type="text"
                                name="certification"
                                placeholder="Certification"
                                value={certificateData.certification}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                            />
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Certificate (PDF)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                />
                            </div>
                            <button
                                onClick={addCertificate}
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-blue-600 transform hover:scale-105'
                                } transition duration-200`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding...
                                    </span>
                                ) : (
                                    'Add Certificate'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Verify Certificate
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="id"
                                placeholder="Enter Certificate ID to verify"
                                value={certificateData.id}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition duration-200"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={verifyCertificate}
                                    disabled={loading}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-success hover:bg-green-600 transform hover:scale-105'
                                    } transition duration-200`}
                                >
                                    {loading ? 'Verifying...' : 'Verify Certificate'}
                                </button>
                                <button
                                    onClick={fetchCertificateDetails}
                                    className="w-full py-3 px-4 rounded-lg bg-warning hover:bg-yellow-500 text-black font-semibold transform hover:scale-105 transition duration-200"
                                >
                                    Fetch Certificate Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {CertificateInfo && (
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Certificate Information
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">ID</p>
                                        <p className="font-semibold text-gray-900">{CertificateInfo.id || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-semibold text-gray-900">{CertificateInfo.name || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Owner</p>
                                        <p className="font-semibold text-gray-900">{CertificateInfo.owner || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Certification</p>
                                        <p className="font-semibold text-gray-900">{CertificateInfo.certification || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className={`font-semibold ${CertificateInfo.isAuthentic ? 'text-green-600' : 'text-red-600'}`}>
                                        {CertificateInfo.isAuthentic ? "✓ Authentic" : "✗ Tampered"}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">IPFS CID</p>
                                    <p className="font-mono text-sm break-all">{CertificateInfo.cid || "N/A"}</p>
                                </div>
                                {CertificateInfo.pdfUrl && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate PDF</h3>
                                        <div className="aspect-[16/9] rounded-lg overflow-hidden border border-gray-200">
                                            <iframe
                                                src={CertificateInfo.pdfUrl}
                                                className="w-full h-full"
                                                title="Certificate PDF"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
