import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import medsymbol from './medsymbol.jpg';
import medfile from './medfile.jpg';

const Healthcare = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [providerAddress, setProviderAddress] = useState("");
    const [patientID, setPatientID] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);
    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientIDD, setPatientIDD] = useState("");

    const contractAddress = "0x717b88d881b72e81ec151241c7a5128f50d679db";
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizedProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        const connectWallet = async () => {
            if (!window.ethereum) {
                alert("Please install Metamask to use this DApp");
                return;
            }
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const accountAddress = await signer.getAddress();
                setProvider(provider);
                setSigner(signer);
                setAccount(accountAddress);
                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(contract);

                const ownerAddress = await contract.getOwner();

                setIsOwner(ownerAddress.toLowerCase() === accountAddress.toLowerCase());

            } catch (error) {
                console.error("Error connecting to the wallet : " + error);
            }
        }
        connectWallet();
    }, [])


    const authorizeProvider = async () => {
        if (isOwner) {
            try {
                if (providerAddress !== "") {
                    const tx = await contract.authorizedProvider(providerAddress);
                    await tx.wait();
                    alert(`Provider Address : ${providerAddress} is authorized`)
                }
                else {
                    alert("Provider Address is required");
                }
            } catch (error) {
                alert(error.reason);
            }
        } else {
            alert("Only Contract OWNER can authorize providers");
        }
    }


    const fetchPatientRecords = async () => {
        if (patientID !== "") {
            try {
                const records = await contract.getPatientRecords(patientID);
                setPatientRecords(records);
            } catch (error) {
                console.error("Error fetching the patient records" + error);
                alert("You are not authorized or Enter a valid patient ID !!!");
            }
        } else {
            alert("Patient ID is required");
        }
    }

    const addRecord = async () => {
        if (patientIDD !== "" && patientName !== "" && diagnosis !== "" && treatment !== "") {
            try {
                const tx = await contract.addRecord(patientIDD, patientName, diagnosis, treatment);
                await tx.wait();
                fetchPatientRecords();
                alert(`Patient Record added with ID : ${patientIDD}`);
            } catch (error) {
                console.error("Error adding the patient record" + error);
            }
        } else {
            alert("All fields are required !!!");
        }
    }

    return (
        <div className='main'>
            <div className='header'>
                <h1><img className='medsymbol' src={medsymbol} />Health Care Records</h1>
                {account && <p>Connected To : {account}</p>}
                {isOwner && <p className='ownerclass'>Owner Mode <span className='green'></span></p>}
                {!isOwner && <p className='ownerclass'>You are not owner<span className='red'></span></p>}
            </div>
            <div className='rectangle-box'>
                <h3>Authorize Healthcare Provider</h3>
                <input type='text' placeholder='  Enter Provider Address' value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} />
                <button onClick={authorizeProvider}>Authorize Provider</button>
            </div>
            <div className='rectangle-box fetchpatientrecords'>
                <h3>Fetch patient Records</h3>
                <input type='text' placeholder='  Enter patient ID' value={patientID} onChange={(e) => setPatientID(e.target.value)} />
                <button onClick={fetchPatientRecords}>Fetch</button>
            </div>
            <div className='rectangle-box patientrecords'>
                <h3><img className='medfile' src={medfile} />Patient Records  </h3>
                {patientRecords.map((record, index) => (
                    <div key={index}>
                        <p>Record ID    : {patientID}</p>
                        <p>Patient Name : {record.patientName}</p>
                        <p>Diagnosis    : {record.diagnosis}</p>
                        <p>Treatment    : {record.treatment}</p>
                        <p>Time         : {new Date(record.timestamp.toNumber() * 1000).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
            <div className='rectangle-box'>
                <h3>Add Patient Records</h3>
                <input type='text' placeholder='  Patient id' value={patientIDD} onChange={(e) => setPatientIDD(e.target.value)} />
                <input type='text' placeholder='  Patient name' value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                <input type='text' placeholder='  Diagnosis' value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                <input type='text' placeholder='  Treatment' value={treatment} onChange={(e) => setTreatment(e.target.value)} />
                <button onClick={addRecord}>Add</button>
            </div>
            <div className='rectangle-box footer'><p><h4>About Us</h4>
                We are Zephyrus, a team dedicated to developing innovative solutions like our healthcare records DApp. Leveraging blockchain technology, we aim to revolutionize healthcare with secure, transparent, and user-empowered data management.</p>
                <p><h4>Copyright Notice</h4>
                    © 2024 Team Zephyrus. All Rights Reserved.
                    Unauthorized reproduction or distribution of this application, its content, or features is strictly prohibited.
                    For inquiries or licensing, contact: teamzephyrus@gmail.com</p>
            </div>
        </div>
    )
}

export default Healthcare;