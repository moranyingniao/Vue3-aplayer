<template>
  <div class="player" :style="direction==='right' ?{'right':'0px'} :{'left':'0px'}">
    <div class="control">
      <div class="avatar">
        <img :src="musicAvatar" :class="musicStatus ? 'active' : ''" alt="">
      </div>
      <div class="control-list">
        <span class="name">{{musicName}}</span>
        <span class="artist">{{musicArtist}}</span>
        <div class="progress">
          <div class="progress-bar bg-success progress-bar-striped progress-bar-animated"
            :style="{'width':timePercentage}"></div>
        </div>
        <div class="control-action">
          <img @click="pre" :src="preico" alt="">
          <img @click="playToggle" :src="musicStatus ? pauseico : playico" alt=" ">
          <img @click="next" :src="nextico" alt="">
          <audio autoplay ref="audio" :src="musicSrc"></audio>
        </div>
      </div>
      <img class="list-ico" @click="open" :src="listOpen ? listHidden : listShow" alt="">
    </div>
    <transition name="plus-icon">
      <div v-if="listOpen" :class="listOpen?  'list animated  bounceInLeft': 'list animated bounceInRight'">
        <div v-for="(item,index) in songs" :key="index" @click="choose(index)" class="item"
          :style="musicIndex === index ? {'background-image':'linear-gradient( 109.6deg,  rgba(24,138,141,1) 11.2%, rgba(96,221,142,1) 91.1% )'} :''">
          <span>{{item.name}}</span>
          <span>{{item.artist}}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, reactive, toRefs, onUnmounted, watchEffect, watch, computed, ToRef, Ref } from 'vue';
let listShow:string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAIZJREFUOE/Vk9ENgCAMRB+buImOopvoJjqJuomjGBJIAMVQbYz2u3253rUG5TLKPP4HbIFaaMMKjH4mXVkdKBR3bL8bSuOsGVLkE+AM9EAElXroA7AKLdBWBJUCN6coBHZXKZeG4oERzA4/8bAKleXusFRhtk/q4RlI/VMmYHltZXUPvwfcAaAiFhXKHLbzAAAAAElFTkSuQmCC'
let listHidden:string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAIlJREFUOE/VlO0JgDAMRF83cRNxEzfRTdRNdBNHkYABP2pLMILt79zrXa404HyCM4/ygC1QG9ewAKNqrpHdgUZz9/GnUsTpCszWG2JAgQ1A4wFUmBhTYAdUCafJUkTc72IF5oqajklikRXqElmTCVSiuJRiLfY0//nDzhUQc58txTXyK5iI//8fbi0aGBUmg9FOAAAAAElFTkSuQmCC'
let playico:string =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAThJREFUOE+tlYsNwjAMBV8nASaBTgJMAkwCnQQ6SWETdFEchTSmQcISoir2+W86+bKTtJXE9zqqPSQ9JY2SeJ5JV3mH8TUavCTdMh1+yx310UFSKYEnSQdJRy+CAm6OL/Y+BwIjAmCtgv4+KgeoAfnhLmnTSioiJZiBrAwIDA/VQjc4SQEBpGZ000uVOiE4pMOeoDcAJNyym2aE5ykjWLNq4NB9gJA97yhRjlwoC+ASGsYNIBF4zagBgZ9jEGX6E0AiYEBr4gGJsmaTgF6Ha0BSnW1IjCakTFO83SyBXqrwmJYVQIyYdm9sqDEphsFdGJsRIN1Jk94wxF6tYfT/WD0cpE3Lj8PSxnzbEBr1cRxQtsvxy/kiMu5l9Xzl60Y9ELqPd2uGHdhV7Origc2hGPPhcNizwd2/gDe1dFHPy4O03gAAAABJRU5ErkJggg==";
let preico:string =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAKxJREFUOE+1lO0NgzAMRB+bwCbtJnQS2kkYhW4Co6CrEglFTewE8O/z8/lD7rg4uot53AocgQn4Ai+nc+kfQb8p5+hwBfoAGoCfIBPSzQEmiUw8W4FytCSFmoECCZhGNVAQtRhHcgqowb+NJbkd5lpsdnjcfMmk26E1u1jEDYwJWogOPxfVQIFKbpuAJbcm0Hoaqdu/QN2b5lTzHOKxf0Leve/L+bHKMmtW1UV2DfI3FSFWFN4AAAAASUVORK5CYII=";
let nextico:string =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAKhJREFUOE+1lMENwjAMAK+bMAqMwiTAJmUS2ARGQfeIZEVqElLXXzuni+N4ITmWZB6HAs/ADXgDT+A7YP8CTsADWK2PhiaFGkKvHaigT6i/1ECTFsW4N2yngC3baWAxrm13A2vbFGCx9THTgE6AL5oCtI/OnLEL6JA7l9qVmAaWK9YfZwpor6JVhP4FFGKvtmBDPYzLoTS+tx+ay6F3eCh/6D4cMugV/QAwiz8VFmQq4gAAAABJRU5ErkJggg==";
let pauseico:string =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAK1JREFUOE/tlUsOgyAQhmeEg+hN9BxiQhc2HsnURUnEc8hN5CDWaWgyKU1f6WMJO5ifL4THB8KfGz7iNU2rwziR8Nb2Ls7ENSnBG9P7uH4HVKqdAbDkkJRZwZO07vJ13ZYrgJy1Q/USWNf7BRFyDiHSbhwHE/phdUR45BoR+Gk6FAl4e85pDyFdm/RSvpADQFaxE5XqSoBt/sg2rKlngg1QxNNFb0II91awv/4IZ4D2CST0Pj85AAAAAElFTkSuQmCC";
let props = defineProps(['songs','direction']);
let timer:ToRef<number> = ref(0);
let listOpen:ToRef<boolean> = ref(false);
let audio:Ref<any> = ref();

interface state{
  musicIndex: number,//当前音乐播放下标
  musicStatus: boolean,//是否播放
  musicName: string,//当前歌名
  musicSrc: string,//当前播放源
  duration: number,//音频长度s
  currentTime: number,//当前播放位置s
  musicArtist: string,//当前作者
  musicLrc: string,//当前歌词
  musicAvatar: string
}
let state:state = reactive({
  musicIndex: 0,//当前音乐播放下标
  musicStatus: false,//是否播放
  musicName: 'test',//当前歌名
  musicSrc: '',//当前播放源
  duration: 0,//音频长度s
  currentTime: 0,//当前播放位置s
  musicArtist: 'test2',//当前作者
  musicLrc: '',//当前歌词
  musicAvatar: 'https://ts1.cn.mm.bing.net/th/id/R-C.867a5ec406f8fb62bf310ca42fe84559?rik=FvpnfMNqHOZ2ZQ&riu=http%3a%2f%2fimg2.woyaogexing.com%2f2017%2f10%2f07%2fb8ae5615b60fec87!400x400_big.jpg&ehk=CLFprcOVbJJNsYQlCbexxjw9qqPjVAdbd88z8C%2bzOCc%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1',//当前歌曲头像
})

onMounted(():void => {
  //加载脚本
  loadingScript();
  timeMusic();
  //检测是否播放
  if (audio.value.paused) {
    state.musicStatus = false;
  } else {
    state.musicStatus = true;
  }
})
onUnmounted(():void => {
  timer.value = 0;
})
//加载外部脚本
const loadingScript = ():void => {
  let link = document.createElement('link');
  let script1 = document.createElement('script');
  let script2 = document.createElement('script');
  let script3 = document.createElement('script');
  link.setAttribute('href', 'https://cdn.staticfile.org/twitter-bootstrap/4.3.1/css/bootstrap.min.css');
  link.setAttribute('rel', 'stylesheet');
  let link2 = document.createElement("link");
  link2.setAttribute("rel", "stylesheet");
  link2.setAttribute(
    "href",
    "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css"
  );
  script1.setAttribute('src', 'https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js');
  script2.setAttribute('src', 'https://cdn.staticfile.org/popper.js/1.15.0/umd/popper.min.js');
  script3.setAttribute('src', 'https://cdn.staticfile.org/twitter-bootstrap/4.3.1/js/bootstrap.min.js')
  let head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
  head.appendChild(link2);
  head.appendChild(script1);
  head.appendChild(script2);
  head.appendChild(script3);
}
const open = ():void => {
  listOpen.value = !listOpen.value
}
const timeMusic = ():void => {
  timer.value = setInterval(():void => {
    state.currentTime = audio.value.currentTime ? audio.value.currentTime : 0;
    state.duration = audio.value.duration;
  }, 1500)
}

//播放事件
const playToggle = ():void => {
  if (musicStatus.value) {
    pause()
  } else {
    play()
  }
}
const play = ():void => {
  //播放第几个
  state.musicSrc = props.songs[state.musicIndex].url;
  let playPromise = audio.value.play();
  playPromise.then((res: any) => {
    musicStatus.value = true;
    console.log(`正在播放《${state.musicName}》`);

  }).catch((err: any) => {
    console.log('加载资源中')
  })
}
const choose = (index: number):void => {
  state.musicIndex = index;
  play();
}
const next = ():void => {
  state.musicIndex++;
  if (state.musicIndex >= props.songs.length) {
    state.musicIndex = 0;
    play()
  } else {
    play();
  }
}
const pre = ():void => {
  state.musicIndex--;
  if (state.musicIndex < 0) {
    state.musicIndex = props.songs.length - 1;
    play()
  } else {
    play()
  }
}
const pause = ():void => {
  musicStatus.value = false;
  audio.value.pause();

}
//计算百分比
const timePercentage = computed(():string => {

  return Number((state.currentTime * 1 / state.duration * 1).toFixed(2)) * 100 + '%'
})
watch(():void => { state.currentTime }, ():void => {
  if (state.currentTime === state.duration) {
    next();
    state.musicStatus = true;
  }

}, { deep: true })
//监听值得改变  立即监听 
watchEffect(():void => {
  state.musicName = props.songs[state.musicIndex].name;
  state.musicArtist = props.songs[state.musicIndex].artist;
  state.musicAvatar = props.songs[state.musicIndex].cover;
  state.musicLrc = props.songs[state.musicIndex].lrc;
  state.musicSrc = props.songs[state.musicIndex].url;
})


let { musicIndex,//当前音乐播放下标
  musicStatus,//是否播放
  musicName,//当前歌名
  musicSrc,//当前播放源
  musicArtist,//当前作者
  musicLrc,//当前歌词
  currentTime,
  duration,
  musicAvatar } = toRefs(state)
</script>

<style scoped lang="scss">
.plus-icon-enter-active {

  transition: opacity .5s;
}

.plus-icon-enter {
  opacity: 0.5;
}

.plus-icon-leave-active {
  transition: all .8s;
}

.plus-icon-leave-to {
  opacity: 1;
  animation: leaveto .8s;
}

@keyframes leaveto {
  0% {
    transform: translateX(0px);
  }

  100% {
    transform: translateX(100px);
  }
}

.active {
  animation: identifier 4s infinite linear;
}

@keyframes identifier {
  0% {
    transform: rotateZ(0deg);
  }

  100% {
    transform: rotateZ(360deg);
  }
}

.player {
  position: absolute;
  padding: 12px;
  bottom: 0;
  width: 300px;
  overflow:hidden ;

  .control {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100px;
    width: 100%;
    border-radius: 8px;
    box-shadow: 1px 1px 11px 1px rgba(0, 0, 0, 0.451), 1px 1px 11px 1px rgba(0, 0, 0, 0.451);
    overflow: hidden;

    .list-ico {
      position: absolute;
      cursor: pointer;
      right: 5px;
      bottom: 5px;

    }

    .avatar {
      width: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      img {
        width: 80px;
        border-radius: 50%;
      }
    }

    .control-list {
      width: 100%;
      display: inline-block;
      height: 100%;
      text-align: center;

      .progress {
        height: 8px;
        margin: 1px 0;
      }

      .name {
        display: block;
      }

      .artist {
        display: block;
      }

      .control-action {
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        img {
          cursor: pointer;
        }
      }
    }
  }

  .list {
    overflow: hidden;
    background-image: linear-gradient(134.6deg, rgba(201, 37, 107, 1) 15.4%, rgba(116, 16, 124, 1) 74.7%);
    border-radius: 8px;

    .item {
      margin: 2px;
      padding: 0 4px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      color: #fff;
      height: 30px;
      box-shadow: 1px 1px 5px .5px rgba(0, 0, 0, 0.299), 1px 1px 5px .5px rgba(0, 0, 0, 0.292);
      border-radius: 8px;
    }
  }
}
</style>