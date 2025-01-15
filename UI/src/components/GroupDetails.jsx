import React from 'react';
import { motion } from 'framer-motion';

function GroupDetails({ group, onBackClick }) {
    return (
        <motion.div className="group-detail-view">
            <button onClick={onBackClick}>Back to Groups</button>
            <h2>{group.name}</h2>
            <p>
                <strong>Description:</strong> {group.description}
            </p>
            <p>
                <strong>Created By:</strong> {group.created_by || 'N/A'}
            </p>
            <p>
                <strong>Created At:</strong>{' '}
                {new Date(group.created_at).toLocaleString()}
            </p>
            <h2>Members</h2>
            <h2>Expenses</h2>
            <h2>Settlements</h2>
        </motion.div>
    );
}

export default GroupDetails;
