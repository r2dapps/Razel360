/**
 * Razel 360 - Multi-Tour Data Repository
 * Luxury Architectural Showcases
 */

const DEMO_VILLA_LUMINA = {
  id: 'tour_villa_lumina',
  title: 'Villa Lumina | Modern Residence',
  location: 'Bel Air Crest, Beverly Hills, CA',
  price: '$14,500,000',
  heroImage: './assets/demo/exterior.jpg',
  scenes: [
    {
      id: 'scene_exterior',
      name: 'Villa Facade & Pool',
      imageSrc: './assets/demo/exterior.jpg',
      hotspots: [
        { id: 'hs_ext_to_living', type: 'portal', targetSceneId: 'scene_living', x: 160, y: -45, z: -360 },
        {
          id: 'callout_pool',
          type: 'info',
          title: 'Negative-Edge Reflection Pool',
          tag: 'EXTERIOR ARCHITECTURE',
          price: '$280,000',
          description: 'Architectural heated saltwater pool with honed basalt coping and flush concealed skimmers.',
          x: 80, y: -130, z: -350
        },
        {
          id: 'callout_facade',
          type: 'info',
          title: 'Cedar Cladding & Post-Tensioned Concrete',
          tag: 'FACADE ARCHITECTURE',
          price: 'Bespoke',
          description: 'Board-formed architectural concrete paired with Japanese Shou Sugi Ban charred cedar finish.',
          x: -240, y: 70, z: -310
        }
      ]
    },
    {
      id: 'scene_living',
      name: 'Grand Living Room',
      imageSrc: './assets/demo/living_room.jpg',
      hotspots: [
        { id: 'hs_living_to_ext', type: 'portal', targetSceneId: 'scene_exterior', x: -380, y: -30, z: -100 },
        { id: 'hs_living_to_kit', type: 'portal', targetSceneId: 'scene_kitchen', x: -320, y: -40, z: -230 },
        { id: 'hs_living_to_balcony', type: 'portal', targetSceneId: 'scene_balcony', x: 260, y: -35, z: -290 },
        {
          id: 'callout_sofa',
          type: 'info',
          title: 'Minotti Freeman Sectional',
          tag: 'ITALIAN FURNITURE',
          price: '$18,400',
          description: 'Custom textured bouclé wool upholstery with dark bronze perimeter structure and down cushions.',
          x: -120, y: -110, z: -340
        },
        {
          id: 'callout_fireplace',
          type: 'info',
          title: 'Bookmatched Calacatta Marble Hearth',
          tag: 'STONE ARCHITECTURE',
          price: '$34,000',
          description: 'Floor-to-ceiling Italian Calacatta slab with clean-burning linear ethanol hearth.',
          x: 290, y: 30, z: -270
        }
      ]
    },
    {
      id: 'scene_kitchen',
      name: 'Chef Kitchen & Island',
      imageSrc: './assets/demo/kitchen.jpg',
      hotspots: [
        { id: 'hs_kit_to_living', type: 'portal', targetSceneId: 'scene_living', x: 330, y: -30, z: 200 },
        { id: 'hs_kit_to_bed', type: 'portal', targetSceneId: 'scene_bedroom', x: -360, y: -35, z: 120 },
        {
          id: 'callout_island',
          type: 'info',
          title: 'Calacatta Borghini Waterfall Island',
          tag: 'KITCHEN ARCHITECTURE',
          price: '$42,000',
          description: '4-inch mitered edge marble with integrated flush induction surface and concealed brass electrical popups.',
          x: -10, y: -80, z: -380
        },
        {
          id: 'callout_hood',
          type: 'info',
          title: 'Bespoke Patinated Bronze Range Hood',
          tag: 'CUSTOM MILLWORK',
          price: '$16,500',
          description: 'Hand-rubbed acid washed dark bronze with high-capacity silent exterior roof blower.',
          x: -40, y: 110, z: -370
        }
      ]
    },
    {
      id: 'scene_bedroom',
      name: 'Primary Master Suite',
      imageSrc: './assets/demo/bedroom.jpg',
      hotspots: [
        { id: 'hs_bed_to_kit', type: 'portal', targetSceneId: 'scene_kitchen', x: 340, y: -35, z: -170 },
        { id: 'hs_bed_to_bath', type: 'portal', targetSceneId: 'scene_bathroom', x: -340, y: -40, z: 190 },
        { id: 'hs_bed_to_balcony', type: 'portal', targetSceneId: 'scene_balcony', x: 270, y: -30, z: 270 },
        {
          id: 'callout_bed',
          type: 'info',
          title: 'Poliform Rever Bedstead',
          tag: 'BEDROOM FURNITURE',
          price: '$12,800',
          description: 'Upholstered platform with full-grain aniline leather headboard and integrated acoustic nightstands.',
          x: -30, y: -80, z: -370
        },
        {
          id: 'callout_slat_wall',
          type: 'info',
          title: 'Acoustic Slatted White Oak Wall',
          tag: 'CUSTOM MILLWORK',
          price: 'Bespoke',
          description: 'Sound-dampening fluted oak slats with concealed ambient cove dimmable LED channels.',
          x: 330, y: 40, z: -210
        }
      ]
    },
    {
      id: 'scene_bathroom',
      name: 'Spa Bathroom & Tub',
      imageSrc: './assets/demo/bathroom.jpg',
      hotspots: [
        { id: 'hs_bath_to_bed', type: 'portal', targetSceneId: 'scene_bedroom', x: 320, y: -40, z: 230 },
        {
          id: 'callout_tub',
          type: 'info',
          title: 'Nero Marquina Monolithic Stone Tub',
          tag: 'SPA BATHROOM',
          price: '$15,800',
          description: 'Hand-carved solid black granite stone soaking tub with floor-mounted Dornbracht faucet.',
          x: -180, y: -80, z: -340
        },
        {
          id: 'callout_vanity',
          type: 'info',
          title: 'Dual Floating Vanities & Halo Mirrors',
          tag: 'MILLWORK & STONE',
          price: '$11,400',
          description: 'Honed marble vanity shelf with twin stone vessel sinks and defogging halo LED mirrors.',
          x: 230, y: 10, z: -320
        }
      ]
    },
    {
      id: 'scene_balcony',
      name: 'Sunset Sky Terrace',
      imageSrc: './assets/demo/balcony.jpg',
      hotspots: [
        { id: 'hs_balcony_to_living', type: 'portal', targetSceneId: 'scene_living', x: 310, y: -35, z: 240 },
        { id: 'hs_balcony_to_bed', type: 'portal', targetSceneId: 'scene_bedroom', x: 350, y: -40, z: -170 },
        {
          id: 'callout_fire_table',
          type: 'info',
          title: 'Linear Concrete Gas Fire Table',
          tag: 'OUTDOOR LIVING',
          price: '$6,200',
          description: 'Cast architectural concrete table with integrated electronic spark glass flame ribbon.',
          x: 20, y: -130, z: -370
        },
        {
          id: 'callout_teak_chairs',
          type: 'info',
          title: 'Roda Teak Outdoor Club Armchairs',
          tag: 'TERRACE FURNITURE',
          price: '$7,400',
          description: 'Marine-grade Indonesian teak frame with quick-dry reticulated foam outdoor cushions.',
          x: 230, y: -90, z: -310
        }
      ]
    }
  ]
};

const DEMO_PALM_ROYALE = {
  id: 'tour_palm_royale',
  title: 'The Palm Royale | French Chateau',
  location: 'Cap d’Antibes & Beverly Park',
  price: '$28,500,000',
  heroImage: './assets/demo2/01_royal_entrance.png',
  scenes: [
    {
      id: 'scene_royale_exterior',
      name: 'Royal Entrance & Facade',
      imageSrc: './assets/demo2/01_royal_entrance.png',
      hotspots: [
        { id: 'hs_pr_ext_to_foyer', type: 'portal', targetSceneId: 'scene_royale_foyer', x: 0, y: -20, z: -390 },
        { id: 'hs_pr_ext_to_pool', type: 'portal', targetSceneId: 'scene_royale_pool', x: 340, y: -40, z: 180 },
        {
          id: 'callout_pr_limestone',
          type: 'info',
          title: 'Hand-Cut French Burgundy Limestone',
          tag: 'FACADE ARCHITECTURE',
          price: 'Bespoke Milled',
          description: 'Solid hand-carved Roman arch portico with honed Burgundy limestone ashlar masonry.',
          x: -180, y: 80, z: -340
        },
        {
          id: 'callout_pr_garden',
          type: 'info',
          title: 'Manicured Mediterranean Parterre Garden',
          tag: 'LANDSCAPE ARCHITECTURE',
          price: '$450,000',
          description: 'Formal French parterre with century-old date palms, sculpted boxwood topiaries, and ambient up-lighting.',
          x: 280, y: -60, z: -270
        }
      ]
    },
    {
      id: 'scene_royale_foyer',
      name: 'Grand Reception Foyer',
      imageSrc: './assets/demo2/02_grand_foyer.png',
      hotspots: [
        { id: 'hs_pr_foyer_to_ext', type: 'portal', targetSceneId: 'scene_royale_exterior', x: 20, y: -30, z: 390 },
        { id: 'hs_pr_foyer_to_living', type: 'portal', targetSceneId: 'scene_royale_living', x: 350, y: -30, z: -170 },
        { id: 'hs_pr_foyer_to_dining', type: 'portal', targetSceneId: 'scene_royale_dining', x: -350, y: -30, z: -160 },
        {
          id: 'callout_pr_glass_art',
          type: 'info',
          title: 'Venetian Murano Glass Chandelier',
          tag: 'CUSTOM ART FIXTURE',
          price: '$65,000',
          description: 'Bespoke hand-blown organic glass sculpture reflecting warm ambient illumination across coffered ceiling.',
          x: -10, y: 190, z: -330
        },
        {
          id: 'callout_pr_marble_floor',
          type: 'info',
          title: 'Crema Marfil Bookmatched Slabs',
          tag: 'SURFACE FINISHES',
          price: '$88,000',
          description: 'Seamless radiant-heated Spanish Crema Marfil marble slabs with satin honed finish.',
          x: 40, y: -160, z: -350
        }
      ]
    },
    {
      id: 'scene_royale_living',
      name: 'Double-Height Great Salon',
      imageSrc: './assets/demo2/03_great_salon.png',
      hotspots: [
        { id: 'hs_pr_liv_to_foyer', type: 'portal', targetSceneId: 'scene_royale_foyer', x: -360, y: -30, z: 150 },
        { id: 'hs_pr_liv_to_kitchen', type: 'portal', targetSceneId: 'scene_royale_kitchen', x: 330, y: -35, z: 200 },
        { id: 'hs_pr_liv_to_terrace', type: 'portal', targetSceneId: 'scene_royale_terrace', x: -30, y: -40, z: -390 },
        {
          id: 'callout_pr_sofa',
          type: 'info',
          title: 'Custom Curved Bouclé Sectional',
          tag: 'BESPOKE FURNITURE',
          price: '$42,000',
          description: 'Organic curved double-sided lounge seating upholstered in French bouclé wool with integrated bronze trays.',
          x: -140, y: -100, z: -340
        },
        {
          id: 'callout_pr_glass_wall',
          type: 'info',
          title: 'Motorized Minimalist Glass Curtains',
          tag: 'ARCHITECTURAL GLAZING',
          price: '$180,000',
          description: '24ft floor-to-ceiling ultra-clear Schuco motorized sliding glass facade opening seamlessly to gardens.',
          x: -320, y: 60, z: -220
        }
      ]
    },
    {
      id: 'scene_royale_dining',
      name: 'Formal Banquet Dining Salon',
      imageSrc: './assets/demo2/07_formal_dining.png',
      hotspots: [
        { id: 'hs_pr_din_to_foyer', type: 'portal', targetSceneId: 'scene_royale_foyer', x: -330, y: -30, z: 210 },
        { id: 'hs_pr_din_to_kitchen', type: 'portal', targetSceneId: 'scene_royale_kitchen', x: 350, y: -30, z: 170 },
        {
          id: 'callout_pr_dining_table',
          type: 'info',
          title: 'Solid American Walnut Banquet Table',
          tag: 'CUSTOM MILLWORK',
          price: '$32,500',
          description: 'Single-slab live-edge American black walnut seating 14 guests, paired with customized leather armchairs.',
          x: 40, y: -90, z: -380
        },
        {
          id: 'callout_pr_chandelier',
          type: 'info',
          title: 'Fluted Brass Tubular Pendant Cluster',
          tag: 'LIGHTING DESIGN',
          price: '$28,000',
          description: 'Multi-tiered brushed antique brass architectural fixture with warm 2700K dimmable LED tubes.',
          x: -220, y: 130, z: -300
        }
      ]
    },
    {
      id: 'scene_royale_kitchen',
      name: 'Chef Sculptural Kitchen',
      imageSrc: './assets/demo2/04_chef_kitchen.png',
      hotspots: [
        { id: 'hs_pr_kit_to_living', type: 'portal', targetSceneId: 'scene_royale_living', x: -350, y: -30, z: -170 },
        { id: 'hs_pr_kit_to_dining', type: 'portal', targetSceneId: 'scene_royale_dining', x: -330, y: -30, z: 210 },
        { id: 'hs_pr_kit_to_terrace', type: 'portal', targetSceneId: 'scene_royale_terrace', x: 340, y: -35, z: 180 },
        {
          id: 'callout_pr_curved_island',
          type: 'info',
          title: 'Monolithic Calacatta Gold Wave Island',
          tag: 'CHEF KITCHEN',
          price: '$56,000',
          description: 'Sculptural curved marble island with integrated concealed induction cooktops and prep sink trough.',
          x: 10, y: -90, z: -380
        },
        {
          id: 'callout_pr_appliances',
          type: 'info',
          title: 'Gaggenau 400 Series Appliance Suite',
          tag: 'LUXURY APPLIANCE',
          price: '$48,000',
          description: 'Flush-integrated combi-steam ovens, warming drawers, vacuum sealer, and full-height refrigerated columns.',
          x: 320, y: 10, z: -230
        }
      ]
    },
    {
      id: 'scene_royale_bedroom',
      name: 'Primary Master Suite Retreat',
      imageSrc: './assets/demo2/05_master_suite.png',
      hotspots: [
        { id: 'hs_pr_bed_to_living', type: 'portal', targetSceneId: 'scene_royale_living', x: -350, y: -30, z: -180 },
        { id: 'hs_pr_bed_to_terrace', type: 'portal', targetSceneId: 'scene_royale_terrace', x: 340, y: -30, z: 180 },
        {
          id: 'callout_pr_round_bed',
          type: 'info',
          title: 'Custom Elliptical Bouclé Bedstead',
          tag: 'BEDROOM SUITE',
          price: '$26,000',
          description: 'Tailored curved platform upholstered in French cashmere bouclé with curved fluted oak headwall alcove.',
          x: -10, y: -80, z: -380
        },
        {
          id: 'callout_pr_alcove',
          type: 'info',
          title: 'Architectural Fluted Oak Niche',
          tag: 'CUSTOM MILLWORK',
          price: 'Bespoke',
          description: 'Curved wood veneer wall panelling with integrated flush nightstands and ambient niche backlighting.',
          x: 0, y: 80, z: -380
        }
      ]
    },
    {
      id: 'scene_royale_terrace',
      name: 'Sunset Sky Terrace & Pavilion',
      imageSrc: './assets/demo2/06_sunset_terrace.png',
      hotspots: [
        { id: 'hs_pr_ter_to_living', type: 'portal', targetSceneId: 'scene_royale_living', x: 260, y: -30, z: -290 },
        { id: 'hs_pr_ter_to_pool', type: 'portal', targetSceneId: 'scene_royale_pool', x: -330, y: -45, z: 200 },
        {
          id: 'callout_pr_terrace_soffit',
          type: 'info',
          title: 'Cantilevered Teak Slat Soffit',
          tag: 'EXTERIOR ARCHITECTURE',
          price: '$92,000',
          description: 'Compound curve marine-grade teak ceiling canopy with flush recessed waterproof LED downlights.',
          x: 20, y: 150, z: -350
        },
        {
          id: 'callout_pr_lounge',
          type: 'info',
          title: 'Dedon MBRACE Outdoor Lounge Group',
          tag: 'TERRACE LIVING',
          price: '$21,400',
          description: 'Fiber-woven modular outdoor sectional with quick-dry reticulated foam cushions and travertine coffee table.',
          x: -90, y: -90, z: -360
        }
      ]
    },
    {
      id: 'scene_royale_pool',
      name: 'Resort Oasis Pool & Loggia',
      imageSrc: './assets/demo2/08_resort_pool.png',
      hotspots: [
        { id: 'hs_pr_pool_to_exterior', type: 'portal', targetSceneId: 'scene_royale_exterior', x: -350, y: -30, z: -170 },
        { id: 'hs_pr_pool_to_terrace', type: 'portal', targetSceneId: 'scene_royale_terrace', x: 330, y: -30, z: 200 },
        {
          id: 'callout_pr_pool',
          type: 'info',
          title: 'Sukabumi Quartzite Heated Pool',
          tag: 'RESORT AMENITIES',
          price: '$380,000',
          description: 'Natural Balinese green Sukabumi stone pool with zero-edge perimeter gutter and shallow Baja sun shelf.',
          x: 80, y: -110, z: -360
        },
        {
          id: 'callout_pr_loggia',
          type: 'info',
          title: 'Bi-Folding Glass Loggia Cabana',
          tag: 'OUTDOOR ARCHITECTURE',
          price: 'Bespoke',
          description: 'Curved second-story cantilevered terrace with pocketing frameless glass doors overlooking resort gardens.',
          x: -240, y: 70, z: -300
        }
      ]
    }
  ]
};
