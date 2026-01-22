import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mensCollectionBanner from "../assets/images/mens-collection-banner.webp";
import womensCollectionBanner from "../assets/images/womens-collection-banner.webp";
import sustainableFabric from "../assets/images/sustainable fabric.webp";
import customEmbroidery from "../assets/images/Custom Embroidery.jpg";

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="hero-section text-center py-5 mb-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Connect with Talented Designers</h1>
          <p className="lead mb-4">
            Browse hundreds of skilled freelance fashion designers ready to
            bring your custom clothing vision to life. Quality designs, fair
            pricing, and transparent collaboration.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link
              to="/marketplace"
              className="btn btn-primary btn-lg px-4 gap-3"
            >
              <i className="fas fa-search me-2"></i>
              Browse Designers
            </Link>
            <Link
              to={user ? "/customer/design-studio" : "/signup"}
              className="btn btn-outline-primary btn-lg px-4"
            >
              <i className="fas fa-palette me-2"></i>
              Create a Design
            </Link>
            {!user && (
              <Link
                to="/signup?role=designer"
                className="btn btn-success btn-lg px-4"
              >
                <i className="fas fa-user-plus me-2"></i>
                Join as Designer
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Marketplace Features */}
      <div className="features-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose Our Marketplace?</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fas fa-users fa-3x text-primary mb-3"></i>
                  <h3 className="card-title h5">Talented Designers</h3>
                  <p className="card-text">
                    Connect with vetted, experienced fashion designers from
                    around the world
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fas fa-hand-holding-usd fa-3x text-success mb-3"></i>
                  <h3 className="card-title h5">Fair Pricing</h3>
                  <p className="card-text">
                    Transparent pricing with designers earning 80% commission on
                    every order
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fas fa-star fa-3x text-warning mb-3"></i>
                  <h3 className="card-title h5">Quality Guaranteed</h3>
                  <p className="card-text">
                    Read reviews and ratings to find the perfect designer for
                    your project
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fas fa-shield-alt fa-3x text-info mb-3"></i>
                  <h3 className="card-title h5">Secure Payments</h3>
                  <p className="card-text">
                    Safe and secure payment processing with timely payouts for
                    designers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="features" className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px", fontSize: "24px" }}
                  >
                    1
                  </div>
                  <h3 className="card-title">Browse & Connect</h3>
                  <p className="card-text">
                    Explore our marketplace of talented designers. Filter by
                    specialization, rating, price range, and availability to
                    find your perfect match.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px", fontSize: "24px" }}
                  >
                    2
                  </div>
                  <h3 className="card-title">Design & Collaborate</h3>
                  <p className="card-text">
                    Create your custom design using our interactive studio. Work
                    directly with your chosen designer through our messaging
                    system.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px", fontSize: "24px" }}
                  >
                    3
                  </div>
                  <h3 className="card-title">Receive & Review</h3>
                  <p className="card-text">
                    Track your order from production to delivery. Once complete,
                    leave a review to help other customers and support great
                    designers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Designers CTA */}
      <div
        className="bg-gradient text-white py-5"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            Are You a Fashion Designer?
          </h2>
          <p className="lead mb-4">
            Join our marketplace and showcase your talent to thousands of
            potential customers. Earn 80% commission on every order you complete
            – among the best rates in the industry!
          </p>
          <div className="row justify-content-center mb-4">
            <div className="col-md-3 col-6 mb-3">
              <h3 className="display-6 fw-bold">80%</h3>
              <p>Commission Rate</p>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <h3 className="display-6 fw-bold">₹500+</h3>
              <p>Min. Payout</p>
            </div>
            <div className="col-md-3 col-6 mb-3">
              <h3 className="display-6 fw-bold">24/7</h3>
              <p>Support</p>
            </div>
          </div>
          <Link
            to="/signup?role=designer"
            className="btn btn-light btn-lg px-5"
          >
            <i className="fas fa-rocket me-2"></i>
            Start Earning Today
          </Link>
        </div>
      </div>

      <div className="shop-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Shop Ready-Made Designs</h2>
            <p className="lead">
              Browse our collection of pre-designed clothing for men and women
            </p>
          </div>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card h-100 overflow-hidden">
                <div className="position-relative">
                  <img
                    src={mensCollectionBanner}
                    className="img-fluid w-100"
                    alt="Men's Collection"
                  />
                  <div className="position-absolute bottom-0 start-0 p-4">
                    <Link
                      to="/shop?gender=Men"
                      className="btn btn-light btn-lg"
                    >
                      Shop Men
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 overflow-hidden">
                <div className="position-relative">
                  <img
                    src={womensCollectionBanner}
                    className="img-fluid w-100"
                    alt="Women's Collection"
                  />
                  <div className="position-absolute bottom-0 start-0 p-4">
                    <Link
                      to="/shop?gender=Women"
                      className="btn btn-light btn-lg"
                    >
                      Shop Women
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="trending-section py-5">
        <div className="container">
          <h2 className="text-center mb-5">Latest Trends</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100">
                <img
                  src={sustainableFabric}
                  className="card-img-top"
                  alt="Sustainable Fabrics"
                />
                <div className="card-body">
                  <h5 className="card-title">Sustainable Fabrics</h5>
                  <p className="card-text">
                    Eco-friendly materials that look good and feel great.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <img
                  src="https://cdn.vectorstock.com/i/1000v/63/42/graphic-geometric-bold-lines-seamless-pattern-vector-46396342.jpg"
                  className="card-img-top"
                  alt="Bold Patterns"
                />
                <div className="card-body">
                  <h5 className="card-title">Bold Patterns</h5>
                  <p className="card-text">
                    Stand out with eye-catching geometric designs.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <img
                  src="https://www.trendstop.com/wp-content/uploads/2021/05/13macrotheme1-920x600-c-default.jpg"
                  className="card-img-top"
                  alt="Vintage Revival"
                />
                <div className="card-body">
                  <h5 className="card-title">Vintage Revival</h5>
                  <p className="card-text">
                    Classic styles reimagined for the modern wardrobe.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <img
                  src={customEmbroidery}
                  className="card-img-top"
                  alt="Custom Embroidery"
                />
                <div className="card-body">
                  <h5 className="card-title">Custom Embroidery</h5>
                  <p className="card-text">
                    Personalized details that make your clothing unique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">What Our Customers Say</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex mb-3">
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                  </div>
                  <p className="card-text">
                    &quot;The quality of my custom shirt exceeded my
                    expectations. The fabric is premium and the fit is
                    perfect!&quot;
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="ms-3">
                      <h6 className="mb-0">John D.</h6>
                      <small className="text-muted">Customer since 2022</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex mb-3">
                    <div className="text-warning">
                      {[...Array(4)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                  </div>
                  <p className="card-text">
                    &quot;The design studio is so intuitive! I created a dress
                    exactly how I imagined it, and the final product was
                    stunning.&quot;
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="ms-3">
                      <h6 className="mb-0">Sarah M.</h6>
                      <small className="text-muted">Customer since 2023</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex mb-3">
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                  </div>
                  <p className="card-text">
                    &quot;I ordered custom shirts for my entire team. The
                    process was smooth, and everyone loves their personalized
                    clothing!&quot;
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="ms-3">
                      <h6 className="mb-0">Michael T.</h6>
                      <small className="text-muted">Customer since 2021</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
