#!/usr/bin/env bash

# GET https://www.bunnings.com.au/_apis/v1/stores/country/AU?fields=FULL

cat bunnings.json \
	| jq -c '[(.data.pointOfServices[] | [
		.displayName,
		.address.region.isocode,
		.address.town,
		(.address.postalCode | tonumber),
		.geoPoint.latitude,
		.geoPoint.longitude
		])]' \
	> map.json
