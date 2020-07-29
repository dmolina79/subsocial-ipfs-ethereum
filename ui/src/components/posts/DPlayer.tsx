import React, { useState, useEffect } from 'react';
import DPlayer from 'react-dplayer';


const PLAYER_COMMON_PARAMS = {
  lang: 'en',
  autoPlay: true,
  theme: '#2185d0'
};

// This is just a part of Player's methods that are used in this component.
// To see all the methods available on APlayer and DPlayer visit the next URLs:
// http://aplayer.js.org/#/home?id=api
// http://dplayer.js.org/#/home?id=api
interface PartOfPlayer {
  pause: () => void;
  destroy: () => void;
}

type PlayerProps = {
  video: {
    url: string,
    name: string,
    pic: string
  }
}

export function Player (props: PlayerProps) {
  const { video } = props;

  const [player, setPlayer] = useState<PartOfPlayer>();

  const onPlayerCreated = (newPlayer: PartOfPlayer) => {
    console.log('onPlayerCreated:', newPlayer);
    setPlayer(newPlayer);
  };

  const destroyPlayer = () => {
    if (!player) return;

    console.log('Destroy the current player');
    player.pause();
    player.destroy();
    setPlayer(undefined);
  };

  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [ video.url ]);

  return <DPlayer
    options={{
      video,
      loop: false,
      ...PLAYER_COMMON_PARAMS
    }}
    onLoad={onPlayerCreated} // Note that DPlayer has onLoad, but APlayer - onInit.
  />;

}
