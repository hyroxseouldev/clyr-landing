export type Testimonial = {
  id: string;
  body: readonly string[];
  instagramHandle: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  featured: boolean;
};

export const testimonials = [
  {
    id: 'hyun-sta-sweat-monday',
    body: [
      '20년 넘게 엘리트 선수로 지내왔지만 새로운 운동을 시작할 때에 항상 벽이 느껴지는 것 같습니다. 그리고 또 수많은 코치와 감독을 만나다 보니, 어떤 코치가 좋은 코치인지도 알 수 있게 되었구요.',
      '원래 잘했던 사람들은 못했던 사람들의 마음을 공감하기에 한계가 있다고 생각합니다. 하지만 그 과정을 겪고 올라간 사람들은 마음까지도 헤아려 줄 수 있다는 것을 전 믿어요.',
      '그렇기에 전준현 코치님과 함께 했고, 그 선택은 옳은 선택이었고, 지금도 제 안목이 옳았다고 생각합니다:)',
    ],
    instagramHandle: 'hyun.sta',
    title: '스웻먼데이 대표',
    imageSrc: '/assets/testimonials/hyun-sta-hyrox.jpeg',
    imageAlt: 'HYROX 챔피언스 포토월 앞에 선 hyun.sta와 선수들',
    featured: true,
  },
] as const satisfies readonly Testimonial[];

export const featuredTestimonials = testimonials.filter(testimonial => testimonial.featured);
