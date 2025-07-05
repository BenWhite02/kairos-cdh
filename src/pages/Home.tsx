interface HomeProps {
  count: number;
  setCount: (count: number) => void;
}

const Home = ({ count, setCount }: HomeProps) => (
  <div className="text-center">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Kairos</h1>
    <p className="text-lg text-gray-600 mb-6">Visual Rule Builder Platform</p>
    <button 
      onClick={() => setCount(count + 1)}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Count is {count}
    </button>
  </div>
);

export default Home;