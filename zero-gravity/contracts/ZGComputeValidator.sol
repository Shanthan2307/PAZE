// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZGComputeValidator
 * @notice Validates 0G Compute results on-chain
 */
contract ZGComputeValidator {
    struct ComputeResult {
        bytes32 taskId;
        bytes32 resultHash;
        address requester;
        uint256 timestamp;
        bool validated;
    }

    mapping(bytes32 => ComputeResult) public results;
    
    event ResultSubmitted(bytes32 indexed taskId, address indexed requester);
    event ResultValidated(bytes32 indexed taskId);

    /**
     * @notice Submit compute result
     */
    function submitResult(
        bytes32 taskId,
        bytes32 resultHash
    ) external {
        require(results[taskId].taskId == bytes32(0), "Result exists");
        
        results[taskId] = ComputeResult({
            taskId: taskId,
            resultHash: resultHash,
            requester: msg.sender,
            timestamp: block.timestamp,
            validated: false
        });
        
        emit ResultSubmitted(taskId, msg.sender);
    }

    /**
     * @notice Validate compute result
     */
    function validateResult(bytes32 taskId) external {
        require(results[taskId].taskId != bytes32(0), "Result not found");
        
        results[taskId].validated = true;
        emit ResultValidated(taskId);
    }

    /**
     * @notice Get result details
     */
    function getResult(bytes32 taskId) 
        external 
        view 
        returns (ComputeResult memory) 
    {
        return results[taskId];
    }
}
