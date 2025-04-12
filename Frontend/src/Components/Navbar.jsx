import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, NavDropdown, Button, Form } from "react-bootstrap";

const SmartAgricultureNavbar = ({ isAuthenticated, userName, userId }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <Navbar expand="lg" className="shadow-sm py-3" style={{ backgroundColor: "#e0f7fa" }}>
                <div className="container-fluid">
                    <Button className="btn-light me-2 border-0" onClick={toggleSidebar}>
                        <i className="bi bi-list"></i>
                    </Button>
                    <Navbar.Brand className="fs-1 fw-bold">Smart Agriculture System</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarNavDropdown" />
                    <Navbar.Collapse id="navbarNavDropdown">
                        <Nav className="ms-auto">
                            <Nav.Link className="fs-5 text-dark" href="/">Home</Nav.Link>
                            <Nav.Link className="fs-5 text-dark" href="#">About</Nav.Link>
                            <NavDropdown title="Services" className="fs-5 text-dark">
                                <NavDropdown.Item href="#">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#">Something else here</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link className="fs-5 text-dark" href="/Contact/us">
                                Contact Us
                            </Nav.Link>
                            {isAuthenticated ? (
                                <>
                                    <div className="fs-5 text-secondary-emphasis">
                                        <Button className="logoicon" href={`/dashboard/${userId}`}>
                                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                                        </Button>
                                    </div>
                                    <form action="/auth/logout" method="POST" style={{ display: "inline" }}>
                                        <Button type="submit" className="btn fs-5 text-white px-3 py-2 shadow-lg bg-danger">
                                            Logout
                                        </Button>
                                    </form>
                                </>
                            ) : null}
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>
            <Navbar expand className="bg-warning">
                <div className="container-fluid">
                    <Nav className="flex-row w-100 justify-content-start">
                        <Nav.Link href="/weather/weatherDisplay">Weather Analysis</Nav.Link>
                        <Nav.Link href="/cropMonitoring/Crop">Crop Monitoring</Nav.Link>
                        <Nav.Link href="/weather/news">Weather Alerts</Nav.Link>
                        <Nav.Link href="/cropMonitoring/crop/Community">Community</Nav.Link>
                        <Form className="d-flex ms-auto">
                            <Form.Control type="search" placeholder="Search" />
                            <Button variant="success">Search</Button>
                        </Form>
                    </Nav>
                </div>
            </Navbar>
            {sidebarOpen && (
                <div className="sidebar" style={{ width: "25vw", height: "100vh", background: "#f8f9fa", position: "fixed", left: 0, top: 0, zIndex: 1000, padding: "20px" }}>
                    <span className="close-btn text-danger" onClick={toggleSidebar} style={{ cursor: "pointer", fontSize: "1.5rem" }}>
                        <i className="bi bi-x-octagon"></i>
                    </span>
                    {isAuthenticated ? (
                        <div className="text-center mb-4 p-3 shadow-sm rounded bg-white">
                            <div className="d-flex justify-content-center align-items-center mb-2">
                                <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}>
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <h4 className="text-dark fw-bold">👤 Welcome, {userName}</h4>
                            <Button variant="primary" className="w-100 my-2">Community Section</Button>
                            <Button variant="success" className="w-100 my-2">Detailed Insights</Button>
                            <Button variant="warning" className="w-100 my-2">Experts Talk</Button>
                            <Button variant="danger" className="w-100 my-2">❓ Help & Support</Button>
                        </div>
                    ) : (
                        <div className="text-center mb-4 p-3 shadow-sm rounded bg-white">
                            <h4 className="text-dark fw-bold">Welcome, Guest</h4>
                            <p className="text-muted">Please log in to access more features.</p>
                            <Button variant="primary" className="w-100" href="/auth/login">Login</Button>
                        </div>
                    )}
                    <div className="mt-4">
                        <Button variant="outline-dark" className="w-100 my-2">🏠 Home</Button>
                        <Button variant="outline-dark" className="w-100 my-2">📜 About</Button>
                        <Button variant="outline-dark" className="w-100 my-2">🛠 Services</Button>
                        <Button variant="outline-dark" className="w-100 my-2">📞 Contact</Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartAgricultureNavbar;
