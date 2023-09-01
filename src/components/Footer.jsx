function footer() {
  return (
    <footer className=" shadow bg-gray-900 ">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="#" className="flex items-center mb-4 sm:mb-0">
            <img src="/img/logo.png" className="h-8 mr-3" alt="Logo" />
          </a>
          {/* <ul className="flex flex-wrap items-center mb-6 text-sm font-medium  sm:mb-0 text-gray-400">
            <li>
              <a href="#" className="mr-4  md:mr-6 ">
                About
              </a>
            </li>
            <li>
              <a href="#" className="mr-4  md:mr-6">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="mr-4  md:mr-6 ">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="">
                Contact
              </a>
            </li>
          </ul> */}
        </div>
        <hr className="my-6  sm:mx-auto border-gray-700 lg:my-8" />
        <span className="block text-sm  sm:text-center text-gray-400">
          © 2023
          <a href="#" className="hover:underline">
            Upper™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
export default footer;
