import json,sys,subprocess,urllib.request,os
voice=sys.argv[1]; d=sys.argv[2]
parts=open(os.path.join(d,'script.txt')).read().split('\n||')
files=[]
for i,p in enumerate(parts):
    gap=0.0
    if i>0:
        g,p=p.split('\n',1); gap=float(g)
    if gap: 
        sf=f'{d}/part_{i:02d}_gap.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',str(gap),sf],check=True); files.append(sf)
    body=json.dumps({"text":p.strip(),"model_id":"eleven_multilingual_v2","voice_settings":{"stability":0.35,"similarity_boost":0.75,"style":0.2,"speed":0.92}}).encode()
    r=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128',data=body,headers={'xi-api-key':'dummy','Content-Type':'application/json'})
    mp=f'{d}/part_{i:02d}.mp3'; open(mp,'wb').write(urllib.request.urlopen(r).read())
    wv=mp[:-4]+'.wav'; subprocess.run(['ffmpeg','-v','error','-y','-i',mp,'-ar','44100','-ac','1',wv],check=True); files.append(wv)
open(f'{d}/concat.txt','w').write(''.join(f"file '{os.path.basename(f)}'\n" for f in files))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{d}/concat.txt','-af','loudnorm=I=-16:TP=-1.5','-ar','44100',f'{d}/voice.wav'],check=True)
print('ok')
