import DropZone from "./components/DropZone";
import Post from "./components/Post";
function App() {
  return (
    <div className="flex ">
      <div className="p-5">

<DropZone/>
      </div>
    <div className="p-5 bg-gray-100 min-h-screen w-full">
<Post/>
    </div>
    </div>
  );
}

export default App;
