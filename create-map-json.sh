#!/usr/bin/env bash

cat bunnings.json \
	| jq -c '[(.data.pointOfServices[] | [
		.displayName,
		.address.region.isocode,
		.geoPoint.latitude,
		.geoPoint.longitude
		])]' \
	> map.json
