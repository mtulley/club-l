function ShopItem({ item }) {
  const { img_url, title, price, id } = item;
  const formattedPrice = "$" + (price / 100).toFixed(2);

  return (
    <div className="shop-item">
      <img className="shop-item__image" src={img_url} />
      <div className="shop-item__below-image">
        <div className="shop-item__info">
          <h4 className="shop-item__title">{title}</h4>
          <p className="shop-item__price">{formattedPrice}</p>
        </div>
        <button className="shop-item__add-button">Add to cart</button>
      </div>
    </div>
  );
}

export default ShopItem;
