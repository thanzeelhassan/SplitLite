import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GroupDetails from "./GroupDetails";
import AddGroup from "./AddGroup";
//import '../../public/styles.css';

const baseUrl = import.meta.env.VITE_API_URL;

function Groups() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [addButtonClick, setAddButtonClick] = useState(false);
  const [hover, setHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groupsDetails, setGroupsDetails] = useState([]);

  // Fetch balances when groups or userId changes
  useEffect(() => {
    // const fetchBalances = async () => {
    //   if (!groupsDetails || !userId) return;

    //   setIsLoading(true);
    //   try {
    //     const token = localStorage.getItem("authToken");
    //     const requests = groupsDetails.map((group) =>
    //       fetch(`${baseUrl}/outstanding_to_user`, {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${token}`,
    //         },
    //         body: JSON.stringify({
    //           group_id: group.group_id,
    //           user_id: userId,
    //         }),
    //       }).then((res) => res.json())
    //     );

    //     const responses = await Promise.all(requests);
    //     const balances = {};
    //     responses.forEach((data, index) => {
    //       const group = groupsDetails[index];
    //       const total = data.receivables.reduce(
    //         (sum, item) => sum + parseFloat(item.amount),
    //         0
    //       );
    //       balances[group.group_id] = total;
    //     });
    //     setGroupBalances(balances);
    //   } catch (error) {
    //     console.error("Error fetching balances:", error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchBalances();

    const fetchGroupsDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${baseUrl}/groups`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to load group details.");
        }
        const data = await response.json();
        setGroupsDetails(data.groups);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false); // End loading
      }
    };
    fetchGroupsDetails();
  }, []);

  const handleCardClick = (group) => {
    setSelectedGroup(group);
  };

  const handleGroupDetailBackClick = () => {
    setSelectedGroup(null);
  };

  function handleAddGroupBackClick() {
    setAddButtonClick(false);
  }

  function createGroupCard(group) {
    const customStyle = {
      color: "#333333",
    };
    let balanceDetails = "You are all settled up!";

    if (group.balance > 0) {
      customStyle.color = "#2ba10e";
      balanceDetails = `You are owed ${balance}`;
    } else if (group.balance < 0) {
      customStyle.color = "#dd3838";
      balanceDetails = `You owe ${Math.abs(balance)}`;
    }

    return (
      <div
        key={group.group_id}
        className="group-card"
        onClick={() => handleCardClick(group)}
      >
        <h3>{group.name}</h3>
        <p className="date">{new Date(group.created_at).toLocaleString()}</p>
        <p>Created By: {group.created_by || "N/A"}</p>
        <p className="balance" style={customStyle}>
          {balanceDetails}
        </p>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <GroupDetails
        group={selectedGroup}
        onBackClick={handleGroupDetailBackClick}
      />
    );
  } else if (addButtonClick) {
    return <AddGroup onClick={handleAddGroupBackClick} />;
  } else {
    return (
      <>
        <motion.div
          className="groups-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Groups</h2>
          {isLoading ? (
            <p>Loading groups...</p>
          ) : groupsDetails && groupsDetails.length > 0 ? (
            <div className="groups-grid">
              {groupsDetails.map(createGroupCard)}
            </div>
          ) : (
            <p>No groups available.</p>
          )}
        </motion.div>
        <button
          className="custom-button"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => {
            setHover(false);
            setAddButtonClick(true);
          }}
        >
          <div className="icon">{hover ? null : "+"}</div>
          <div className="text">{hover ? "Add Group" : null}</div>
        </button>
      </>
    );
  }
}

export default Groups;
