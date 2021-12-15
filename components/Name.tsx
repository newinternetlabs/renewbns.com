import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
  KeyIcon,
} from "@heroicons/react/solid";

const Name = (props: {
  name: string;
  address: string;
  expiry: number;
  renew: Function;
  currentBlock: number;
  legacy: boolean;
  price: number;
}) => {
  return (
    <li>
      <div className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-600 truncate">
              {props.name}
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Expires in {props.expiry - props.currentBlock} blocks
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <KeyIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                {props.address}
              </p>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <CalendarIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                Expiry #{props.expiry}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              {props.legacy ? (
                <button
                  onClick={(e) => props.renew(e, props.name)}
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled
                >
                  Unsupported name
                </button>
              ) : (
                <button
                  onClick={(e) => props.renew(e, props.name, props.price)}
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Renew now: {props.price / 1000000.0} STX
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default Name;
