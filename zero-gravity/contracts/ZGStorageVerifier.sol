// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZGStorageVerifier
 * @notice Verifies 0G Storage proofs on-chain
 */
contract ZGStorageVerifier {
    struct StorageProof {
        bytes32 merkleRoot;
        uint256 fileSize;
        uint256 timestamp;
        address uploader;
        bool verified;
    }

    mapping(bytes32 => StorageProof) public proofs;
    
    event ProofSubmitted(bytes32 indexed merkleRoot, address indexed uploader);
    event ProofVerified(bytes32 indexed merkleRoot);

    /**
     * @notice Submit storage proof
     */
    function submitProof(
        bytes32 merkleRoot,
        uint256 fileSize
    ) external {
        require(proofs[merkleRoot].merkleRoot == bytes32(0), "Proof exists");
        
        proofs[merkleRoot] = StorageProof({
            merkleRoot: merkleRoot,
            fileSize: fileSize,
            timestamp: block.timestamp,
            uploader: msg.sender,
            verified: false
        });
        
        emit ProofSubmitted(merkleRoot, msg.sender);
    }

    /**
     * @notice Verify storage proof
     */
    function verifyProof(bytes32 merkleRoot) external {
        require(proofs[merkleRoot].merkleRoot != bytes32(0), "Proof not found");
        
        proofs[merkleRoot].verified = true;
        emit ProofVerified(merkleRoot);
    }

    /**
     * @notice Get proof details
     */
    function getProof(bytes32 merkleRoot) 
        external 
        view 
        returns (StorageProof memory) 
    {
        return proofs[merkleRoot];
    }
}
