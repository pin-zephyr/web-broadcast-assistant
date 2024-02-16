// @ts-check

import * as AssistantModel from '../models/assistant-model.js';

import './source-item.js';
import './app-button.js';

/**
Source Device List Component
*/

const template = document.createElement('template');
template.innerHTML = `
<style>
/* Styles go here */

#scan {
	border-radius: 20px;
}

#container {
	display: flex;
	flex-direction: column;
}
#list {
	display: flex;
	flex-direction: column;
}
</style>
<div id="container">
<app-button id="scan">SCAN SOURCE</app-button>
<div id="list">
</div>
</div>
`;

export class SourceDeviceList extends HTMLElement {
	#list
	#scanButton
	#model

	constructor() {
		super();

		this.addFoundSource = this.addFoundSource.bind(this);

		const shadowRoot = this.attachShadow({mode: 'open'});
	}

	connectedCallback() {
		console.log("connectedCallback - SourceDeviceList");

		this.shadowRoot?.appendChild(template.content.cloneNode(true));
		// Add listeners, etc.
		this.#scanButton = this.shadowRoot?.querySelector('#scan');
		this.#list = this.shadowRoot?.querySelector('#list');

		this.sendStartSourceScan = this.sendStartSourceScan.bind(this);

		this.#scanButton.addEventListener('click', this.sendStartSourceScan)

		this.#model = AssistantModel.getInstance();

		this.#model.addEventListener('source-found', this.addFoundSource)
	}

	disconnectedCallback() {
		// Remove listeners, etc.
	}

	sendStartSourceScan() {
		console.log("Clicked Start Source Scan")

		this.#model.startSourceScan();
	}

	addFoundSource(evt) {
		const { source } = evt.detail;

		console.log('EVT', evt);

		// TODO: Change check to address - just use the name for now ... ignore duplicates...
		const elements = this.#list.querySelectorAll('source-item');
		let _source = null;
		elements.forEach( e => {
			var sourceName = e.shadowRoot.getElementById('name')?.textContent
			if (sourceName === source.name) {
				_source = e;
				return;
			}
		});
		console.log(_source);

		// TODO: Update RSSI before returning
		if (_source) {
			_source.setModel(source);
			return;
		}

		const el = document.createElement('source-item');
		this.#list.appendChild(el);
		el.setModel(source);

		// For now, just some simple green selector color. Only one can be selected at a time
		el.addEventListener('click', () => {
			var elements = this.#list.querySelectorAll('source-item');
			elements.forEach( _el => {
				if (_el.isSameNode(el)) {
					const { selectedSource } = _el;
					this.dispatchEvent(new CustomEvent('source-selected', {detail: { selectedSource }}));

					_el.style.backgroundColor = "green";
				} else {
					_el.style.backgroundColor = "white";
				}
			});

			// TODO: If element was clicked, send event to model, so that model
			// can tell USB to let connected sinks sync to the Broadcast Source
		});


	}

}


customElements.define('source-device-list', SourceDeviceList);
