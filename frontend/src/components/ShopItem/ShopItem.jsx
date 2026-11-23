// Styles
import "./ShopItem.css";

function ShopItem({ item }) {
  const { img_url, title, price } = item;
  const formattedPrice = "$" + (price / 100).toFixed(2);

  return (
    <div id="shop-item">
      <img id="shop-item__image" src={img_url} />
      <div id="shop-item__below-image">
        <div id="shop-item__info">
          <h4 id="shop-item__title">{title}</h4>
          <p id="shop-item__price">{formattedPrice}</p>
        </div>
        <button id="shop-item__add-button">Add to cart</button>
      </div>
    </div>
  );
}

export default ShopItem;
