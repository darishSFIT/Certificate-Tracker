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

    // Verify certificate authenticity and return all details including CID
    function verifyCertificate(
        string memory _id
    ) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool,
        string memory
    ) {
        Certificate memory cert = certificates[_id];
        require(bytes(cert.id).length != 0, "Certificate not found");
        return (cert.id, cert.name, cert.owner, cert.certification, cert.isAuthentic, cert.cid);
    }

    // Retrieve certificate's IPFS CID (keeping this for backward compatibility)
    function getCertificateCID(string memory _id) public view returns (string memory) {
        Certificate memory cert = certificates[_id];
        require(bytes(cert.id).length != 0, "Certificate not found");
        return cert.cid;
    }
}