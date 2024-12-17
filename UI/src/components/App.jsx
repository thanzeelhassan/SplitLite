import React,{useState, useEffect} from "react";
import { toast } from 'react-toastify';
import ToastContainerComponent from './Toasts';

function App(){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the API
        fetch("http://localhost:3000/name")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json(); // Parse JSON response
            })
            .then((data) => {
                console.log(data);
                setData(data); // Save data to state
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
                setLoading(false);
            });
    }, []); // Empty dependency array ensures this runs only once

    if (loading) return <div>Loading...</div>;
    if (error){
        console.log("Couldn't get API response")
        toast.error('Error fetching data. Please try again later.',{
            style: {
                backgroundColor: "#c80815",
                color: "white",
            }
        });
    }

    return (
        <div className="container">
            <h1>Hello {data.name}</h1>
            <ToastContainerComponent />
        </div>
    );
}

export default App;