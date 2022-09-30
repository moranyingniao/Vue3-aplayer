<template>
  <Aplayer :songs='songs' />
  <!-- 参数说明 -->
  <!-- direction方向参数 -->
</template>
<script setup lang="ts">
import { reactive,toRefs } from 'vue'
import Aplayer from './views/Aplayer.vue';
let state = reactive({
  songs: [
    {
      name: '爱上是你的错11111111111111111111111',
      artist: 'Hanser',
      url: 'https://music.163.com/song/media/outer/url?id=1978036723.mp3',
      cover: 'https://p1.music.126.net/K0-IPcIQ9QFvA0jXTBqoWQ==/109951163636756693.jpg?param=300y300', // prettier-ignore
      lrc: 'https://cdn.moefe.org/music/lrc/thing.lrc',
    },
    {
      name: '万千花蕊慈母悲哀',
      artist: '泠鸢yousa',
      url: 'https://music.163.com/song/media/outer/url?id=1903991886.mp3 ',
      cover: 'https://p1.music.126.net/K0-IPcIQ9QFvA0jXTBqoWQ==/109951163636756693.jpg?param=300y300', // prettier-ignore
      lrc: 'https://cdn.moefe.org/music/lrc/kyoukiranbu.lrc',
    }
  ]
})
let { songs } = toRefs(state)
</script>
<style scoped>

</style>
