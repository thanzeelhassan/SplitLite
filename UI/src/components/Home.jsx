import React from 'react';
import { motion } from 'framer-motion';

function Home(props) {
    return (
        <motion.div
            className="profile-details"
            intial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <h2>Home</h2>
        </motion.div>
    );
}

export default Home;
