#!/bin/sh
# Music + SFX from Mixkit (free under the Mixkit License, incl. social/commercial video). Not committed; run to fetch.
set -e; cd "$(dirname "$0")/audio"
get() { [ -s "$1" ] || curl -sL -A "Mozilla/5.0" -o "$1" "$2"; }
M=https://assets.mixkit.co/music; X=https://assets.mixkit.co/active_storage/sfx
get m_curiosity.mp3 $M/480/480.mp3          # act 1: setup, curiosity
get m_discover.mp3 $M/587/587.mp3
get m_descent.mp3 $M/614/614.mp3            # struggle
get m_piano.mp3 $M/22/22.mp3
get m_dreaming.mp3 $M/31/31.mp3             # turn / growth
get m_ambition.mp3 $M/32/32.mp3
get m_echoes.mp3 $M/188/188.mp3
get s_paper.mp3 $X/1530/1530-preview.mp3     # scene change
get s_page.mp3 $X/1104/1104-preview.mp3
get s_woosh.mp3 $X/1492/1492-preview.mp3
get s_pop.mp3 $X/3005/3005-preview.mp3       # element pops
get s_click.mp3 $X/2364/2364-preview.mp3
get s_coins.mp3 $X/1993/1993-preview.mp3
get s_coinwin.mp3 $X/1992/1992-preview.mp3
get s_stamp.mp3 $X/1365/1365-preview.mp3
get s_bell.mp3 $X/931/931-preview.mp3
get s_zap.mp3 $X/2365/2365-preview.mp3
get s_type.mp3 $X/1125/1125-preview.mp3
echo ok
