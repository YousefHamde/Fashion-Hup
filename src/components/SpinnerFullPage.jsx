import Spinner from "./Spinner";

function SpinnerFullPage() {
  return (
    <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center bg-white">
      <Spinner />
    </div>
  );
}

export default SpinnerFullPage;
