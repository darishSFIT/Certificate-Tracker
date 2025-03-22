// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract CertificateTracker {
    struct Certificate {
        string id;
        string name;
        string owner;
        string certification;
        bool isAuthentic;
        string cid; // Field for IPFS CID
    }

    mapping(string => Certificate) private certificates;

    // Add new certificate details
    function addCertificate(
        string memory _id,
        string memory _name,
        string memory _owner,
        string memory _certification,
        string memory _cid
    ) public {
        require(bytes(certificates[_id].id).length == 0, "Certificate ID already exists");
        certificates[_id] = Certificate(_id, _name, _owner, _certification, true, _cid);
    }

    // Verify certificate authenticity
    function verifyCertificate(
        string memory _id
    ) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool
    ) {
        Certificate memory cert = certificates[_id];
        require(bytes(cert.id).length != 0, "Certificate not found");
        return (cert.id, cert.name, cert.owner, cert.certification, cert.isAuthentic);
    }

    // Retrieve certificate's IPFS CID
    function getCertificateCID(string memory _id) public view returns (string memory) {
        Certificate memory cert = certificates[_id];
        require(bytes(cert.id).length != 0, "Certificate not found");
        return cert.cid;
    }
}





// // // //old code
// // contract FoodLabel {
// //     struct Certificate {
// //         string name;
// //         string owner;
// //         string expiryDate;
// //         string qrCodeHash;
// //         bool isAuthentic;
// //     }

// //     mapping(string => Certificate) public Certificates;  // Mapping Certificate ID to Certificate details
// //     address public owner;

// //     constructor() {
// //         owner = msg.sender;
// //     }

// //     modifier onlyOwner() {
// //         require(msg.sender == owner, "Only the owner can perform this action");
// //         _;
// //     }

// //     function addCertificate(
// //         string memory _CertificateId,
// //         string memory _name,
// //         string memory _owner,
// //         string memory _expiryDate,
// //         string memory _qrCodeHash
// //     ) public onlyOwner {
// //         require(bytes(Certificates[_CertificateId].name).length == 0, "Certificate already exists");
// //         Certificates[_CertificateId] = Certificate(_name, _owner, _expiryDate, _qrCodeHash, true);
// //     }

// //     function verifyCertificate(string memory _CertificateId) public view returns (
// //         string memory name,
// //         string memory owner,
// //         string memory expiryDate,
// //         bool isAuthentic
// //     ) {
// //         require(bytes(Certificates[_CertificateId].name).length != 0, "Certificate not found");
// //         Certificate memory Certificate = Certificates[_CertificateId];
// //         return (Certificate.name, Certificate.owner, Certificate.expiryDate, Certificate.isAuthentic);
// //     }

// //     function markAsTampered(string memory _CertificateId) public onlyOwner {
// //         require(bytes(Certificates[_CertificateId].name).length != 0, "Certificate not found");
// //         Certificates[_CertificateId].isAuthentic = false;
// //     }
// // }








// contract CertificateTracker {
//     struct Certificate {
//         string id;
//         string name;
//         string owner;
//         string certification;
//         bool isAuthentic;
//     }

//     mapping(string => Certificate) private Certificates;

//     // Add new Certificate details
//     function addCertificate(
//         string memory _id,
//         string memory _name,
//         string memory _owner,
//         string memory _certification
//     ) public {
//         require(bytes(Certificates[_id].id).length == 0, "Certificate ID already exists");
//         Certificates[_id] = Certificate(_id, _name, _owner, _certification, true);
//     }

//     // Verify Certificate authenticity
//     function verifyCertificate(string memory _id) public view returns (
//         string memory,
//         string memory,
//         string memory,
//         string memory,
//         bool
//     ) {
//         Certificate memory Certificate = Certificates[_id];
//         require(bytes(Certificate.id).length != 0, "Certificate not found");
//         return (
//             Certificate.id,
//             Certificate.name,
//             Certificate.owner,
//             Certificate.certification,
//             Certificate.isAuthentic
//         );
//     }
// }