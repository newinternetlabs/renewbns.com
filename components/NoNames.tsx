import { SearchIcon } from "@heroicons/react/solid";

export default function NoNames(props: {
  setShowNotifyModal: Function;
  setShowSearchModal: Function;
}) {
  return (
    <div className="text-center mt-8 mb-8">
      <h3 className="mt-2 text-sm font-medium text-gray-900">No names found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Some legacy Stacks 1.0 names are hard to find.
      </p>
      <div className="mt-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            props.setShowSearchModal(true);
          }}
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <SearchIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Search for my old names
        </button>
      </div>
    </div>
  );
}
