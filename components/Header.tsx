{/* Fixed Header - Always visible */ }
const Header = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center text-white">
            {/* Left side */}
            <div className="text-white text-sm">Abnalem</div>

            {/* Center elements */}
            <div className="flex items-center space-x-8 text-sm text-white/80">
                <span>04:21 PM, CET</span>
                <span>hello@abnalem.com</span>
            </div>

            <div className="flex items-center space-x-1 text-sm text-white/80">
                <span>About,</span>
                <span>Shop</span>
            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-6 text-sm text-white/80">
                {/* <span>About</span>
          <span>Shop</span> */}
                <span>Contact</span>
            </div>
        </nav>
    )
}
export default Header;