# リール自動編集のしくみ（reel-maker）

人気リールを分析して作った「型（レシピ）」に、**撮った動画と入れたい文字を入れるだけ**で、縦型のリール動画（1080×1920・13秒）を自動で作ります。

## フォルダの中身

| 場所 | 中身 | たとえると |
|---|---|---|
| `templates/` | 型。時間・文字の位置・色・カウントダウンなど | レシピ |
| `reels/` | リール設定。使う動画・入れる文字・BGM | 材料のメモ |
| `input/` | 撮った動画を入れる場所 | 材料 |
| `output/` | できあがったリール | 完成した料理 |
| `make_reel.py` | 型どおりに編集するプログラム | 料理する人 |
| `make_test_clips.py` | 撮影前にためすための、テスト用動画を作る | 練習用の材料 |

※ `input/` と `output/` の動画は、ファイルが大きいので GitHub には保存しません。

## 今ある型：`quiz_3choice.json`（3択クイズ型）

参考動画（`reference-video-analysis/analysis_report.md`）と同じ流れです。

| 時間 | 映像（撮るもの） | 文字 |
|---|---|---|
| 0〜3秒 | `wide`：3つ並んだ引き（カメラは動かさない） | タイトル＋問いかけ＋カウントダウン3・2・1 |
| 3〜7.8秒 | `pan`：左→真ん中→右と、1つずつ寄って映す | 「このうち1つに〜」＋ A・B・C |
| 7.8〜13秒 | `pullback`：右のアップから、3つ全部が入るまで引く | 「それはどれでしょう？」→「答えは〜とコメントしてね」 |

## 使い方

### 1. 動画を撮る（縦向き）
- `input/wide.mp4`：3つ全部が入る引き（3秒以上）
- `input/pan.mp4`：左に寄って、1つにつき1秒くらい止まりながら右へ（5秒くらい）
- `input/pullback.mp4`：右のアップから、ゆっくり引いて3つ全部（5秒くらい）

撮った動画の名前を、この3つの名前に変えて `input/` に入れます。
（別の名前のままにしたいときは、`reels/` の設定の `clips` を書きかえます。最初の数秒を飛ばしたいときは `start` に秒数を入れます）

### 2. 文字を決める
`reels/shugorei_shindan.json` の `texts` を書きかえます。
- `\n` で改行
- `{ }` でかこんだ文字は大きくなります（例：`答えは「{守護霊}」と`）

### 3. 作る
```
cd reel-maker
python3 make_reel.py reels/shugorei_shindan.json --preview   # まず確認用の画像だけ作る
python3 make_reel.py reels/shugorei_shindan.json             # リール動画を作る
```
`output/shugorei_shindan.mp4` ができあがります。

### A・B・C の位置や時間がずれたとき
撮った動画によって、置き物がアップになる時間がちがいます。`reels/` の設定の `labels` で直せます。
```json
"labels": {
  "A": {"start": 3.6, "end": 4.5, "y": 0.82},
  "B": {"start": 5.2, "end": 6.0}
}
```
`start`・`end` は動画のはじめからの秒数、`x`・`y` は画面の左・上からの位置（0〜1）です。

### BGM を入れるとき
```json
"bgm": {"file": "../input/bgm.mp3", "delay": 0.45, "volume": 0.8}
```
- `delay`：音楽が始まるまでの秒数（参考動画では 0.45秒）
- 最後の1秒は自動で小さくなっていきます
- 著作権（作った人の権利）のない音楽を使ってください。インスタで投稿するときに音楽を選ぶなら、`null` のまま（無音）でOKです。

## 新しいリールを作るとき
`reels/shugorei_shindan.json` をコピーして名前を変え、`output` と `texts` を書きかえます。

## 必要なもの
- Python 3、ffmpeg
- `pip install opencv-python-headless pillow numpy`
- 日本語フォント（Noto Serif CJK JP / Noto Sans CJK JP の Bold）
