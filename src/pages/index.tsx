import React from 'react';
import Lyrics from '../components/Lyrics';
import { getLyric } from '../pages/api/lyrics'

const App: React.FC = () => {
  return (
    <div>
      <Lyrics getLyric={getLyric} />
    </div>
  );
};

export default App;
