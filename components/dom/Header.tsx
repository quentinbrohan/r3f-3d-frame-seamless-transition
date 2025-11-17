const Header = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 grid grid-cols-12 w-full items-center text-white">
            {/* Left side */}
            <div className="col-start-1 col-end-3 text-white text-sm">Abnalem</div>

            {/* Center elements */}
            <div className="col-start-3 col-end-6 flex items-center space-x-8 text-sm text-white/80 invisible md:visible">
                <span>04:21 PM, CET</span>
                <span>hello@abnalem.com</span>
            </div>

            {/* Navigation */}
            <div className="col-start-9 col-end-12 flex items-center space-x-1 text-sm text-white/80 invisible md:visible">
                <span>About,</span>
                <span>Shop</span>
            </div>

            {/* Right side navigation */}
            <div className="col-start-12 col-end-13 flex items-center space-x-6 text-sm text-white/80 justify-end">
                <span>Contact</span>
            </div>
        </nav>
    )
}
export default Header;
