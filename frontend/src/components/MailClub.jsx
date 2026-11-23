function MailClub() {
  return (
    <section className="mail-club-container">
      <div className="mail-club-content">
        <div className="mail-club-info">
          <h4>Welcome to my mail club!</h4>
          <p>
            When you subscribe to Club/L you will receive a monthly package
            which includes a 5x7 print, a letter, & sticker(s). All items are
            original and made by me each month.
          </p>
          <button className="signup-button" type="button">
            Subscribe
          </button>
          <button className="manage-subscription-button" type="button">
            Manage Subscription
          </button>
        </div>
        <div className="mail-club-example">
          <img
            src="/mail-club-collage.png"
            alt="Examples of Mail Club artwork"
          />
        </div>
      </div>
    </section>
  );
}

export default MailClub;
