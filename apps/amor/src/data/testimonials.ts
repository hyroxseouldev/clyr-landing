export type TestimonialAuthor = {
  name: string;
  title?: string;
  instagramHandle?: string;
};

export type TestimonialQuote = {
  author: TestimonialAuthor;
  body: readonly string[];
};

export type Testimonial = {
  id: string;
  headline: string;
  imageSrc: string;
  imageAlt: string;
  featured: boolean;
  quotes: readonly TestimonialQuote[];
};

export const testimonials = [
  {
    id: 'hyun-sta-sweat-monday',
    headline: '선택의 기준이 된 코칭',
    imageSrc: '/assets/testimonials/hyun-sta-hyrox.webp',
    imageAlt: 'HYROX 챔피언스 포토월 앞에 선 hyun.sta와 선수들',
    featured: true,
    quotes: [
      {
        author: {
          name: '@hyun.sta',
          title: '스웻먼데이 대표',
          instagramHandle: 'hyun.sta',
        },
        body: [
          '20년 넘게 엘리트 선수로 지내왔지만 새로운 운동을 시작할 때에 항상 벽이 느껴지는 것 같습니다. 그리고 또 수많은 코치와 감독을 만나다 보니, 어떤 코치가 좋은 코치인지도 알 수 있게 되었구요.',
          '원래 잘했던 사람들은 못했던 사람들의 마음을 공감하기에 한계가 있다고 생각합니다. 하지만 그 과정을 겪고 올라간 사람들은 마음까지도 헤아려 줄 수 있다는 것을 전 믿어요.',
          '그렇기에 전준현 코치님과 함께 했고, 그 선택은 옳은 선택이었고, 지금도 제 안목이 옳았다고 생각합니다:)',
        ],
      },
    ],
  },
  {
    id: 'im-yubin-lee-gyuri-hyrox',
    headline: '대회 직전, 기록을 바꾼 7번의 레슨',
    imageSrc: '/assets/testimonials/im-yubin-lee-gyuri-hyrox.webp',
    imageAlt: 'HYROX 챔피언스 포토월 앞에 선 임유빈, 이규리 선수와 전준현 코치',
    featured: true,
    quotes: [
      {
        author: {
          name: '임유빈',
        },
        body: [
          '하이록스 대회를 앞두고 파트너랑 유튜브와 인스타에 나오는 훈련들을 서로 공유하며 무작정 따라하며 하루하루 운동해왔다. 하지만 운동하면서 이게 맞는걸까?라는 의문점이 가득 들었을 때 알게 된 준현 코치님.',
          '여러 물음표 투성에 한달도 채 안남은 시점에서 운동 할 공간까지 사라져 불안함 마음이 가득했을 때 알게 된 준현 코치님.',
          '파트너와 일하는 시간이 달라 제한적인 스케줄에도 서울, 인천 오가며 단 7번의 레슨으로 530페이스도 힘들었던 우리를 단번에 350페이스로 이끌어 주셨고 컨디션에 맞게 또 그날의 상황에 맞게 계속해서 체크하고 기록하며 성장할 수 있게끔 끌어주셨습니다! 우리한테 부족한 부분을 채워 주시고 대회직전 포인트 훈련, 대회 당일날까지도 남들 신경 쓸 필요없다고 우리가 최고라고 멘탈까지 관리해주신 코치님.',
          '비록 플래그는 못 땄지만 age 5등이라는 성적으로 더 올라갈 곳이 남았기에 코치님이 수업하는 곳이라면 어디든 따라갈 예정입니다!!!',
        ],
      },
      {
        author: {
          name: '이규리',
        },
        body: [
          '대회가 얼마 남지 않은 상황에서 스테이션은 자신있었지만 러닝 페이스와 스테이션 후 러닝 페이스 유지가 힘들었는데 코치님과 수업 후 딱 부족했던 부분만 잘 채워져서 좋은 성적을 낼 수 있었습니다!',
          '수업이 남들과 같은 수업보단 정말 몸소 경험해보시고 어떤 수업들이 부족한 부분을 채울 수 있을지 정확하게 하시는 것 같아 너무 효율적인 수업이였습니다~!!',
        ],
      },
    ],
  },
] as const satisfies readonly Testimonial[];

export const featuredTestimonials = testimonials.filter(testimonial => testimonial.featured);
