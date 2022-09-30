<template>

  <!--音乐播放器-->
  <div class="music-container" :style="props.direction === 'right' ? {'right':'10px'} : 
  {'left':'10px'}" :class="{'music-active-switch': offsetThreshold}">
    <!-- 当前音乐 -->
    <div class="title">{{title}}</div>
    <div class="music-disk">
      <!--唱片图片-->
      <img class="music-disk-picture" :class="{'music-disk-playing-style': playState}" :src="cover" alt="">
    </div>
    <!--进度条-->
    <div class="music-slider">
      <el-slider v-model="playTime" :format-tooltip="tooltipFormat" size="small" :max="sliderLength"
        @change="changePlayTime" />
    </div>

    <!--按钮组-->
    <div class="button-group">
      <!--上一曲 按钮-->
      <button class="play-button" @click="lastButtonClick">
        <icon-go-start theme="outline" size="23" fill="#939393" :strokeWidth="3" strokeLinejoin="miter"
          strokeLinecap="butt" />
      </button>
      <!--播放 按钮-->
      <button class="play-button" @click="playButtonClick">
        <icon-play-one v-if="!playState" theme="outline" size="23" fill="#939393" :strokeWidth="3"
          strokeLinejoin="miter" strokeLinecap="butt" />
        <icon-pause v-if="playState" theme="outline" size="23" fill="#939393" :strokeWidth="3" strokeLinejoin="miter"
          strokeLinecap="butt" />
      </button>
      <!--下一曲 按钮-->
      <button class="play-button" @click="nextButtonClick">
        <icon-go-end theme="outline" size="23" fill="#939393" :strokeWidth="3" strokeLinejoin="miter"
          strokeLinecap="butt" />
      </button>
      <!--音量按钮-->
      <div class="voice-container">
        <button class="voice-button" @click="voiceButtonClick">
          <icon-volume-notice v-if="!voiceMute" theme="outline" size="23" fill="#939393" :strokeWidth="3"
            strokeLinejoin="miter" strokeLinecap="butt" />
          <icon-volume-mute v-if="voiceMute" theme="outline" size="23" fill="#939393" :strokeWidth="3"
            strokeLinejoin="miter" strokeLinecap="butt" />
        </button>
        <div class="voice-slider">
          <el-slider v-model="voicePower" :max="1" :step="0.1" size="small" @change="changeVoicePower" />
        </div>
      </div>
    </div>
    <audio ref="musicAudio" class="audio-component" controls preload="auto" @canplay="changeDuration">
      <source ref="musicSource" type="audio/mpeg" />
    </audio>
  </div>
 
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, defineProps, ToRef } from "vue";
//这里是自己封装的axios请求，可以将这里替换成自己的请求逻辑


//初始化唱片  base64ma
let mosong = `data:image/webp;base64,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`
let props = defineProps(['songs','direction']);


//是否正在播放
const playState: ToRef<boolean> = ref(false);

//现在的播放时间
const playTime: ToRef<number> = ref(0.00);

//歌曲的时间长度
const playDuration: ToRef<number> = ref(0.00);

//进度条长度
const sliderLength: ToRef<number> = ref(100);

//歌曲URL
const musicUrl = ref("");
//当前播放名字
let title: ToRef<string> = ref('')
//歌曲头像
let cover: ToRef<string> = ref(mosong)
//播放器标签
const musicAudio: any = ref(null);

//实现音乐播放的标签
const musicSource: any = ref(null);

//是否静音
const voiceMute: ToRef<boolean> = ref(false);

//音量大小
const voicePower = ref(0.5);

interface musicState {
  musicArr: Array<{
    name?: string, artist?: string,
    url?: string,
    cover?: string, // prettier-ignore
    lrc?: string
  }>,
  musicCount: number

}
const musicState: musicState = reactive({

  musicArr: [],
  musicCount: 0
})

const musicCursor = ref(0);

//页面偏移量
const pageOffset = ref(0)

//是否达到阈值，达到阈值就显示播放器，反之
const offsetThreshold = ref(false)

//激活播放器
const operateMusicPlayer = () => {

  pageOffset.value = window.scrollY
  //当页面滚动偏移达到800，激活用户框
  if (pageOffset.value > 800) {

    offsetThreshold.value = true
  } else {

    //反之
    offsetThreshold.value = false
  }
}

//播放按钮点击回调
const playButtonClick = () => {
  if (playState.value) {

    musicAudio.value.pause()
  } else {
    let playPromise: Promise<any> = musicAudio.value.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('正在播放!');
      }).catch(() => {
        console.log('资源加载中!');
      })
    }
  }

  //修改播放时间【设置这个，当一首歌正常播放结束之后，再次点击播放按钮，进度条会得到重置】
  playTime.value = musicAudio.value.currentTime

  //重新设置播放状态
  playState.value = !playState.value
}

//上一曲按钮点击回调
const lastButtonClick = () => {

  musicCursor.value -= 1

  changeMusic()
}

//下一曲按钮点击回调
const nextButtonClick = () => {

  musicCursor.value += 1

  changeMusic()
}

//歌曲进度条文本提示
const tooltipFormat = (val: any) => {


  let strTime: number = playTime.value

  let strMinute = parseInt(strTime / 60 + '')

  let strSecond = parseInt(strTime % 60 + '')

  return strMinute + ":" + strSecond
}

//当歌曲能播放时【亦即在canplay钩子函数中】，musicAudio.value.duration才不会是NaN，才能进行歌曲长度的设置
const changeDuration = () => {

  if (playDuration.value != musicAudio.value.duration) {


    //修改进度条的最大值
    sliderLength.value = musicAudio.value.duration

    //修改歌曲播放时间
    playDuration.value = musicAudio.value.duration
  }
}

//el-slider的钩子函数，拖动进度条时快进歌曲，改变当前播放进度
const changePlayTime = (val: any) => {

  musicAudio.value.currentTime = val
}

//音量按钮点击回调
const voiceButtonClick = () => {

  voiceMute.value = !voiceMute.value

  if (!voiceMute.value) {

    voicePower.value = 1

    musicAudio.value.volume = 1
  } else {

    voicePower.value = 0

    musicAudio.value.volume = 0
  }
}

//el-slider的钩子函数，用于调节音量
const changeVoicePower = (val: any) => {

  musicAudio.value.volume = val

  voicePower.value = val

  if (val > 0) {

    voiceMute.value = false
  } else {

    voiceMute.value = true
  }

}

//播放状态下，进度条里的数值每秒递增。而Audio因为在播放状态下，currentTime会自己递增，所以不用处理
const updatePlayTimePerSecond = () => {

  if (playState.value) {

    playTime.value += 1

    if (playTime.value >= playDuration.value) {

      //代表当前歌曲已经播放完毕，进行切歌
      musicCursor.value++

      changeMusic()
    }
  }
}
//语音播报系统
const speak = (msgs: string) => {
  let msg = new window.SpeechSynthesisUtterance();
  msg.text = msgs;
  msg.lang = "zh-cn";
  msg.volume = 3;
  msg.rate = 1;
  msg.pitch = 1;
  speechSynthesis.speak(msg);
}

//切歌
const changeMusic = () => {

  //切歌【这里的music_url是后端返回给前端的json字符串中，用于存储歌曲在线链接的属性名是：music_url，所以要实现自己的请求逻辑，将这里的music_url改为自己的即可】
  if (musicState.musicArr[musicCursor.value % musicState.musicCount].url) {
    musicSource.value.src = musicState.musicArr[musicCursor.value % musicState.musicCount].url
  } else {
    speak('音频资源加载失败！！！')
  }

  cover.value = musicState.musicArr[musicCursor.value % musicState.musicCount].cover || mosong
  title.value = musicState.musicArr[musicCursor.value % musicState.musicCount].name || '未知歌名'
  // 当刷新了url之后，需要执行load方法才能播放这个音乐
  musicAudio.value.load()

  playTime.value = musicAudio.value.currentTime

  sliderLength.value = musicAudio.value.duration

  let playPromise: Promise<any> = musicAudio.value.play();
  if (playPromise) {
    playPromise.then(() => {
      console.log('正在播放!');
    }).catch(() => {
      console.log('资源加载中!');
    })
  }
  playState.value = true
}

//初始化歌曲源【将这里替换成自己的请求逻辑】
const initMusicArr = () => {
  musicState.musicArr = props.songs

  musicState.musicCount = props.songs.length
  // requests.get("/Music/QueryAllMusic").then(function (res:any) {
  //优化控制台的报错，原因是资源未加载完成导致的播放被打断

  //进来就加载资源
  // })
}

onMounted(() => {

  initMusicArr()

  //播放状态下，使播放进度自增1，以与Audio内置的currentTime相匹配
  setInterval(updatePlayTimePerSecond, 1000)

  //添加滚动事件
  window.addEventListener("scroll", operateMusicPlayer)
})

onUnmounted(() => {

  window.removeEventListener("scroll", operateMusicPlayer)
})
</script>

<style lang="scss" scoped>
.music-container {
  position: absolute;
  justify-content: center;
  z-index: 999;
  width: 280px;
  height: 120px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.061), 1px 1px 12px rgba(0, 0, 0, 0.139);
  bottom: 65px;
  opacity: 1;
  transition: 0.5s;
  overflow: hidden;
  &:hover {
    box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.51), 1px 1px 12px rgba(0, 0, 0, 0.503);
  }
}

.title {
  display: inline-block;
  padding: 10px 10px 0 120px;
  white-space: nowrap;
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-disk {

  position: absolute;
  width: 90px;
  height: 90px;
  left: 15px;
  top: 10px;
  border-radius: 50%;
}

.music-disk-picture {

  width: 90px;
  height: 90px;
  border-radius: 50%;
  /*设置图片不可点击*/
  pointer-events: none;
}

.music-disk-playing-style {

  animation: music-disk-rotate 5s linear infinite;
}

@keyframes music-disk-rotate {

  0% {

    transform: rotate(0deg);
  }

  100% {

    transform: rotate(360deg);
  }
}

.button-group {

  position: absolute;
  width: 330px;
  height: 38px;
  left: 90px;
  bottom: 13px;
  margin-left: 10px;
}

.button-group>button {

  margin-left: 10px;
}

.play-button {

  float: left;
  width: 31px;
  height: 31px;
  padding: 4px;
  margin: 0px;
  border: 0px;
  border-radius: 50%;
  margin: 7px 0px 0px 0px;
}

.voice-button {

  float: left;
  width: 31px;
  height: 31px;
  padding: 0px;
  /*margin: 0px;*/
  border: 0px;
  border-radius: 50%;
  margin: 7px 0px 0px 0px;
  background-color: transparent;
}


.music-slider {

  position: absolute;
  top: 30px;
  left: 120px;
  width: 50%;
}

.voice-container {

  float: left;
  margin-left: 12px;
  width: 31px;
  height: 38px;
  overflow: hidden !important;
  transition: 0.5s;
}

.voice-container:hover {

  width: 160px;
}


.voice-slider {

  position: relative;
  top: 2px;
  right: -30px;
  width: 90px;
  height: 35px;
  background-color: white;
  border-radius: 10px;
  padding: 0px 15px 0px 15px;
  transition: 0.2s;
}

.audio-component {

  width: 300px;
  height: 200px;
  top: 100px;
  display: none;
}

.music-active-switch {

  opacity: 1;
}

.lrc {
  position: absolute;
  bottom: 10px;
  width: 100%;
  height: 50px;
  text-align: center;
  z-index: 999;
  border-radius: 8px;
  background-color: rgb(238, 121, 175);
  border: 1px solid;
}
</style>