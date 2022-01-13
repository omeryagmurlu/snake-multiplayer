<script lang="ts">
    import Window from "../components/Window.svelte";
    import { controls, Control, mobileCheck, sensorCheck } from "../stores/settings";

    const DESC: Record<Control, string> = {
        [Control.Keyboard]: 'use mouse keys to change direction',
        [Control.Swipe]: 'swipe on the screen in four directions to change direction',
        [Control.Sensor]: 'tilt the screen in four direction to change direction'
    }
    
</script>

<Window title="controls">
    <div>selected: <span class="selected">{$controls.toLowerCase()}</span></div>
    <div>{DESC[$controls]}</div>
    <div>available controls:</div>
    <button disabled={mobileCheck()} on:click={() => controls.set(Control.Keyboard)}>{Control.Keyboard.toLowerCase()}</button>
    <button disabled={!mobileCheck()} on:click={() => controls.set(Control.Swipe)}>{Control.Swipe.toLowerCase()}</button>
    <button disabled={!sensorCheck()} on:click={() => controls.set(Control.Sensor)}>{Control.Sensor.toLowerCase()}</button>
</Window>