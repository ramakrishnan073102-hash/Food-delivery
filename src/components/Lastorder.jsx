import Cart from "./Cart";
import { useState }  from "react";
import { useEffect } from "react";


function LastOrder() {
    const [lastOrder, setLastOrder] = useState([]);

    useEffect(() => {
        const storedLastOrder = localStorage.getItem("LastOrder");
        if (storedLastOrder) {
            setLastOrder(JSON.parse(storedLastOrder));
        }
    }, []);

    return (
        <div>
            <h2>Last Order</h2>
            <Cart items={lastOrder} />
        </div>

        
    );

}