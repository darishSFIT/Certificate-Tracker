import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './contractABI.json';
import axios from 'axios';
// import logo from './logo.svg';
import Header from './Header';
import './App.css';

//var cont_addr = "enter_here";
//console.log("Contract Address:", cont_addr);
const contractAddress = '0xd9633098c794ba2dceabb300807570869bb25bd2'; // Replace with your contract's address

// Pinata configuration
const PINATA_API_KEY = 'e648d34f4dbbe45a91c7';
const PINATA_SECRET_KEY = 'd8e0207ff09c80bc22cc52df62be1b8d7027a2f077972d668df043843fbbd80b';

function App() {
    const [certificateData, setCertificateData] = useState({
        id: '',
        name: '',
        owner: '',
        certification: '',
        password: '',
        confirmPassword: '',
        nickname: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [CertificateInfo, setCertificateInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationPassword, setVerificationPassword] = useState('');
    const [searchBy, setSearchBy] = useState('id'); // 'id' or 'nickname'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showSearchForm, setShowSearchForm] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Effect to handle dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, [darkMode]);

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

        if (!verificationPassword) {
            alert("Please enter the certificate password");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.ready; 
        provider.getNetwork = async () => ({ chainId: 1337, name: 'ganache' });
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        setLoading(true);
        try {
            let result;
            let cid;
            let certificateId;

            if (searchBy === 'id') {
                certificateId = certificateData.id;
            } else {
                // Get the certificate ID from nickname first
                try {
                    certificateId = await contract.getIdFromNickname(certificateData.nickname);
                } catch (error) {
                    throw new Error("Nickname not found");
                }
            }

            // Now verify the certificate using the ID
            result = await contract.verifyCertificate(certificateId, verificationPassword);
            cid = await contract.getCertificateCID(certificateId, verificationPassword);

            setCertificateInfo({
                id: result[0],
                name: result[1],
                owner: result[2],
                certification: result[3],
                isAuthentic: result[4],
                cid: cid,
                pdfUrl: `https://gateway.pinata.cloud/ipfs/${cid}`
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

        if (certificateData.password !== certificateData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!certificateData.password) {
            alert("Please enter a password");
            return;
        }

        setLoading(true);
        try {
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
                ipfsCid,
                certificateData.password,
                certificateData.nickname
            );

            await tx.wait();
            alert("✅ Certificate added successfully!");
            
            // Reset form
            setCertificateData({
                id: '',
                name: '',
                owner: '',
                certification: '',
                password: '',
                confirmPassword: '',
                nickname: ''
            });
            setSelectedFile(null);
        } catch (error) {
            console.error("Detailed Error:", error);
            alert("❌ Failed to add Certificate: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`flex flex-col min-h-screen w-full transition-colors duration-300 ${
            darkMode ? 'bg-black text-white' : 'bg-gray-50'
        }`}>
            <Header 
                onAddClick={(show = true) => {
                    setShowAddForm(show);
                    if (show) setShowSearchForm(false);
                }}
                onSearchClick={(show = true) => {
                    setShowSearchForm(show);
                    if (show) setShowAddForm(false);
                }}
                showAddForm={showAddForm}
                showSearchForm={showSearchForm}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />

            {/* Main Content */}
            <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 pb-12 pt-20 md:pt-20">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Home Page Content */}
                    {!showAddForm && !showSearchForm && !CertificateInfo && (
                        <div className="space-y-8 sm:space-y-12 lg:space-y-16 py-6 sm:py-8 fade-in">
                            {/* Hero Section */}
                            <div className="text-center max-w-4xl mx-auto">
                                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight`}>
                                    Secure Certificate Stoage
                                    <span className={darkMode ? 'text-samsung-blue-light' : 'text-primary'}> on Blockchain</span>
                                </h1>
                                <p className={`text-lg sm:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                                    Store and manage certificates securely using blockchain technology and IPFS storage
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                <div className={`p-6 ${darkMode ? 'bg-dark-card border border-dark-border' : ''} rounded-xl hover:-translate-y-1 transition-all duration-300`}>
                                    <div className={darkMode ? 'text-samsung-blue-light mb-4' : 'text-primary mb-4'}>
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Secure Storage
                                    </h3>
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        Your certificates are securely stored on the blockchain with password protection
                                    </p>
                                </div>

                                <div className={`p-6 ${darkMode ? 'bg-dark-card border border-dark-border' : ''} rounded-xl hover:-translate-y-1 transition-all duration-300`}>
                                    <div className={darkMode ? 'text-samsung-blue-light mb-4' : 'text-primary mb-4'}>
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Tamper-Proof
                                    </h3>
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        Blockchain ensures your certificates cannot be modified once stored
                                    </p>
                                </div>

                                <div className={`p-6 ${darkMode ? 'bg-dark-card border border-dark-border' : ''} rounded-xl hover:-translate-y-1 transition-all duration-300`}>
                                    <div className={darkMode ? 'text-samsung-blue-light mb-4' : 'text-primary mb-4'}>
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Easy Access
                                    </h3>
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        Access your certificates instantly using ID or nickname from anywhere
                                    </p>
                                </div>
                            </div>

                            {/* How It Works Section */}
                            <div className="card p-6 sm:p-8">
                                <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    How It Works
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                                    <div className="text-center">
                                        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-primary text-2xl font-bold">1</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Upload Certificate</h3>
                                        <p className="text-gray-600 text-sm">Upload your PDF certificate and fill in the details</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-primary text-2xl font-bold">2</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Set Password</h3>
                                        <p className="text-gray-600 text-sm">Secure your certificate with a password</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-primary text-2xl font-bold">3</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Store on Blockchain</h3>
                                        <p className="text-gray-600 text-sm">Certificate is stored securely on blockchain</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-primary text-2xl font-bold">4</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Access Anytime</h3>
                                        <p className="text-gray-600 text-sm">Access and verify your certificate using ID or nickname</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Forms and Certificate Info */}
                    <div className="w-full max-w-4xl mx-auto">
                        {showAddForm && (
                            <div className="card p-6 sm:p-8 mb-8 fade-in">
                                <h2 className={`text-2xl font-semibold mb-6 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Add New Certificate
                                </h2>
                                <div className="space-y-4">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="id"
                                            placeholder="Certificate ID"
                                            value={certificateData.id}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Certificate Name"
                                            value={certificateData.name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="owner"
                                            placeholder="Certified to (Owner name)"
                                            value={certificateData.owner}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="certification"
                                            placeholder="Certification Authority"
                                            value={certificateData.certification}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter Password"
                                            value={certificateData.password}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            value={certificateData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="nickname"
                                            placeholder="Nickname (Optional)"
                                            value={certificateData.nickname}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Certificate (.pdf, .jpg, .jpeg, .png)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <button
                                        onClick={addCertificate}
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                                            loading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'btn-primary hover:shadow-lg'
                                        } transition duration-200`}
                                    >
                                        {loading ? 'Adding...' : 'Add Certificate'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showSearchForm && (
                            <div className="card p-6 sm:p-8 mb-8 fade-in">
                                <h2 className={`text-2xl font-semibold mb-6 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    View Certificate
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex space-x-4 mb-4">
                                        <button
                                            onClick={() => setSearchBy('id')}
                                            className={`px-4 py-2 rounded-lg ${
                                                searchBy === 'id'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            Search by ID
                                        </button>
                                        <button
                                            onClick={() => setSearchBy('nickname')}
                                            className={`px-4 py-2 rounded-lg ${
                                                searchBy === 'nickname'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            Search by Nickname
                                        </button>
                                    </div>
                                    {searchBy === 'id' ? (
                                        <input
                                            type="text"
                                            name="id"
                                            placeholder="Certificate ID"
                                            value={certificateData.id}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            name="nickname"
                                            placeholder="Certificate Nickname"
                                            value={certificateData.nickname}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    )}
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={verificationPassword}
                                        onChange={(e) => setVerificationPassword(e.target.value)}
                                        className="form-input"
                                    />
                                    <button
                                        onClick={verifyCertificate}
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                                            loading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'btn-primary hover:shadow-lg'
                                        } transition duration-200`}
                                    >
                                        {loading ? 'Verifying...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {CertificateInfo && (
                            <div className="card p-6 sm:p-8 fade-in">
                                <h2 className={`text-2xl font-semibold mb-6 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
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
                                    {/* <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className={`font-semibold ${CertificateInfo.isAuthentic ? 'text-green-600' : 'text-red-600'}`}>
                                            {CertificateInfo.isAuthentic ? "✓ Authentic" : "✗ Tampered"}
                                        </p>
                                    </div> */}
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
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
