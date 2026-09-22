// External
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// Components

//Styles
import "./styles/Product.css";

export default function Product() {
  const [item, setItem] = useState(null);
  const { id } = useParams();

  const getItem = async () => {
    const url = `http://localhost:3000/store-items/${id}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getItem();
  }, [id]);

  if (!item) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="product-page">
          <img src={item.image} />
          <div>
            <h4>{item.name}</h4>
            <p>${item.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
