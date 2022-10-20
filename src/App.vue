<template>
  <Music :songs="songs" :direction="'left'"/>
</template>

<script setup lang="ts">
import { Options, Vue } from 'vue-class-component';
import Music from './components/Music.vue';
import { reactive, toRefs } from 'vue'

let data = reactive({
  songs: [
    {
      name: "若把你",
      artist: "刘瑾睿",
      url: "https://music.163.com/song/media/outer/url?id=865632948.mp3",
      cover: 'https://p1.music.126.net/5zs7IvmLv7KahY3BFzUmrg==/109951163635241613.jpg?param=300y300', // prettier-ignore
      lrc: "https://cdn.moefe.org/music/lrc/thing.lrc",
    },
    {
      name: "与你到永久",
      artist: "（烟嗓）",
      url: "https://music.163.com/song/media/outer/url?id=1984888642.mp3",
      cover: 'https://www.keaidian.com/uploads/allimg/190323/23134516_6.jpg', // prettier-ignore
      lrc: "https://cdn.moefe.org/music/lrc/thing.lrc",
    },
    {
      name: "盛夏",
      artist: "毛不易",
      url: "https://music.163.com/song/media/outer/url?id=569212211.mp3",
      cover: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hnbSTflFnUaPJtALGG0CfQAAAA?pid=ImgDet&rs=1', // prettier-ignore
      lrc: "https://cdn.moefe.org/music/lrc/thing.lrc",
    },
    {
      name: "温柔",
      artist: "五月天",
      url: "https://music.163.com/song/media/outer/url?id=386538.mp3",
      cover: 'https://tupian.qqw21.com/article/UploadPic/2019-3/20193822535754301.jpg', // prettier-ignore
      lrc: "https://cdn.moefe.org/music/lrc/thing.lrc",
    },
  ]
})

let {songs} =toRefs(data);
// @Options({
//   components: {
//     Music,
//   },
// })
// export default class App extends Vue { }
</script>

<style lang="scss">

</style>
