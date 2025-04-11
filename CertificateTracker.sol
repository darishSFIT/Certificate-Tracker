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
        string password; // Added password field
        string nickname; // Added nickname field
    }

    mapping(string => Certificate) private certificates;
    mapping(string => string) private nicknameToId; // Maps nickname to certificate ID

    // Add new certificate details
    function addCertificate(
        string memory _id,
        string memory _name,
        string memory _owner,
        string memory _certification,
        string memory _cid,
        string memory _password,
        string memory _nickname
    ) public {
        require(bytes(certificates[_id].id).length == 0, "Certificate ID already exists");
        require(bytes(_password).length > 0, "Password cannot be empty");
        
        certificates[_id] = Certificate(
            _id,
            _name,
            _owner,
            _certification,
            true,
            _cid,
            _password,
            _nickname
        );

        // If nickname is provided, map it to the certificate ID
        if (bytes(_nickname).length > 0) {
            require(bytes(nicknameToId[_nickname]).length == 0, "Nickname already in use");
            nicknameToId[_nickname] = _id;
        }
    }

    // Verify certificate authenticity with password
    function verifyCertificate(
        string memory _id,
        string memory _password
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
        require(keccak256(bytes(cert.password)) == keccak256(bytes(_password)), "Invalid password");
        return (cert.id, cert.name, cert.owner, cert.certification, cert.isAuthentic, cert.cid);
    }

    // Get certificate by nickname with password
    function getCertificateByNickname(
        string memory _nickname,
        string memory _password
    ) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool,
        string memory
    ) {
        string memory _id = nicknameToId[_nickname];
        require(bytes(_id).length != 0, "Nickname not found");
        return verifyCertificate(_id, _password);
    }

    // Retrieve certificate's IPFS CID with password
    function getCertificateCID(
        string memory _id,
        string memory _password
    ) public view returns (string memory) {
        Certificate memory cert = certificates[_id];
        require(bytes(cert.id).length != 0, "Certificate not found");
        require(keccak256(bytes(cert.password)) == keccak256(bytes(_password)), "Invalid password");
        return cert.cid;
    }

    // Get certificate ID from nickname
    function getIdFromNickname(string memory _nickname) public view returns (string memory) {
        string memory _id = nicknameToId[_nickname];
        require(bytes(_id).length != 0, "Nickname not found");
        return _id;
    }
}